import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Tooltip,
  Switch,
  message,
  Tag,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SubjectListApi from "../../../api/SubjectList";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const toStatusLabel = (value) => (value ? "Active" : "Inactive");

const parseStatus = (raw) => {
  if (typeof raw === "boolean") {
    return raw;
  }
  if (raw === null || raw === undefined) {
    return false;
  }
  if (typeof raw === "number") {
    return raw === 1;
  }
  const normalized = raw.toString().trim().toLowerCase();
  return ["1", "true", "show", "active", "enabled", "on"].includes(normalized);
};

export default function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    class: "all",
    level: "all",
    semester: "all",
    status: "all",
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const { current: currentPage, pageSize } = pagination;
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const navigate = useNavigate();

  const normalizeSubjects = (list = []) =>
    list.map((item, index) => {
      const subjectId = item.subjectId ?? item.subject_id ?? item.id ?? null;
      const className = item.className ?? item.class_name ?? "-";
      const levelName = item.levelName ?? item.level_name ?? "-";
      const semesterName =
        item.semesterName ?? item.semester_name ?? item.semester ?? "-";
      const rawStatus = item.status ?? item.Status ?? item.state ?? null;
      const statusBool = parseStatus(rawStatus);

      return {
        subjectId: subjectId ?? `SUB${String(index + 1).padStart(3, "0")}`,
        subjectCode: item.subjectCode ?? item.subject_code ?? "-",
        subjectName: item.subjectName ?? item.subject_name ?? "-",
        className,
        levelName,
        semesterName,
        passMark: item.passMark ?? item.pass_mark ?? 0,
        description: item.description ?? "",
        createdAt: item.createdAt ?? item.created_at ?? null,
        status: statusBool,
        statusLabel: toStatusLabel(statusBool),
      };
    });

  useEffect(() => {
    SubjectListApi.getAll()
      .then((response) => {
        console.log("✅ Data backend:", response);
        const subjects = response?.data ?? response ?? [];
        setSubjects(normalizeSubjects(subjects));
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching subjects:", error);
        message.error("Failed to load subjects");
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => {
    const classes = new Set();
    const levels = new Set();
    const semesters = new Set();

    subjects.forEach((item) => {
      if (item.className && item.className !== "-") {
        classes.add(item.className);
      }
      if (item.levelName && item.levelName !== "-") {
        levels.add(item.levelName);
      }
      if (item.semesterName && item.semesterName !== "-") {
        semesters.add(item.semesterName);
      }
    });

    return {
      classes: Array.from(classes).sort(),
      levels: Array.from(levels).sort(),
      semesters: Array.from(semesters).sort(),
    };
  }, [subjects]);

  const searchTerm = filters.search.trim().toLowerCase();

  const filteredSubjects = subjects.filter((item) => {
    let matchesSearch = true;
    if (searchTerm) {
      const isNumericOnly = /^\d+$/.test(searchTerm);
      if (isNumericOnly) {
        const idDigits = (item.subjectId ?? "").toString().replace(/\D/g, "");
        matchesSearch = idDigits.includes(searchTerm);
      } else {
        const candidates = [
          item.subjectId,
          item.subjectCode,
          item.subjectName,
          item.className,
          item.levelName,
          item.semesterName,
          item.statusLabel,
        ];
        matchesSearch = candidates
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(searchTerm));
      }
    }
    if (!matchesSearch) {
      return false;
    }
    const matchesClass =
      filters.class === "all" || item.className === filters.class;
    const matchesLevel =
      filters.level === "all" || item.levelName === filters.level;
    const matchesSemester =
      filters.semester === "all" || item.semesterName === filters.semester;
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && item.status) ||
      (filters.status === "inactive" && !item.status);
    return matchesClass && matchesLevel && matchesSemester && matchesStatus;
  });

  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(start, start + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, size) => {
    setPagination({ current: page, pageSize: size });
  };

  const handleCreateSubject = () => {
    navigate("/manager/subject/create");
  };

  const handleEditSubject = (record) => {
    navigate(`/manager/subject/edit/${record.subjectId}`);
  };

  const handleDelete = async (record) => {
    try {
      await SubjectListApi.delete(record.subjectId);
      message.success("Subject deleted successfully");
      setSubjects((prev) =>
        prev.filter((subject) => subject.subjectId !== record.subjectId)
      );
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete subject");
    }
  };

  const handleStatusChange = async (record, checked) => {
    setUpdatingStatusId(record.subjectId);
    try {
      await SubjectListApi.updateStatus(record.subjectId, checked);
      setSubjects((prev) =>
        prev.map((subject) =>
          subject.subjectId === record.subjectId
            ? { ...subject, status: checked, statusLabel: toStatusLabel(checked) }
            : subject
        )
      );
      message.success("Status updated");
    } catch (error) {
      console.error("Status update error:", error);
      message.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "subjectId",
      key: "subjectId",
    },
    {
      title: "Subject Code",
      dataIndex: "subjectCode",
      key: "subjectCode",
    },
    {
      title: "Subject Name",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Level",
      dataIndex: "levelName",
      key: "levelName",
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
    },
    {
      title: "Pass Mark",
      dataIndex: "passMark",
      key: "passMark",
      render: (value) => value?.toFixed(1),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.status ? "green" : "red"}>
          {record.statusLabel}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View details">
            <button
              type="button"
              onClick={() =>
                message.info("Detail view not implemented yet.")
              }
              style={actionButtonStyle}
            >
              <EyeOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Edit">
            <button
              type="button"
              onClick={() => handleEditSubject(record)}
              style={actionButtonStyle}
            >
              <EditOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Status">
            <Switch
              checked={record.status}
              onChange={(checked) => handleStatusChange(record, checked)}
              loading={updatingStatusId === record.subjectId}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <button
              type="button"
              onClick={() => handleDelete(record)}
              style={{ ...actionButtonStyle, color: "#ff4d4f" }}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={toolbarContainerStyle}>
        <div style={filtersRowStyle}>
          <Input
            placeholder="Search subjects..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            allowClear
            value={filters.search}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
            style={{ width: 260, minWidth: 220 }}
          />

          <Select
            value={filters.class}
            onChange={(value) => handleFilterChange("class", value)}
            options={[
              { value: "all", label: "All Classes" },
              ...filterOptions.classes.map((value) => ({
                value,
                label: value,
              })),
            ]}
            style={{ minWidth: 140 }}
          />

          <Select
            value={filters.level}
            onChange={(value) => handleFilterChange("level", value)}
            options={[
              { value: "all", label: "All Levels" },
              ...filterOptions.levels.map((value) => ({
                value,
                label: value,
              })),
            ]}
            style={{ minWidth: 130 }}
          />

          <Select
            value={filters.semester}
            onChange={(value) => handleFilterChange("semester", value)}
            options={[
              { value: "all", label: "All Semesters" },
              ...filterOptions.semesters.map((value) => ({
                value,
                label: value,
              })),
            ]}
            style={{ minWidth: 150 }}
          />

          <Select
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            options={STATUS_FILTER_OPTIONS}
            style={{ minWidth: 140 }}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateSubject}
          style={{ minWidth: 160 }}
        >
          Create New Subject
        </Button>
      </div>

      <h2 style={{ marginBottom: 16 }}>Manage Subjects</h2>
      <Table
        columns={columns}
        dataSource={paginatedSubjects}
        rowKey="subjectId"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredSubjects.length,
          showSizeChanger: false,
          onChange: handlePageChange,
        }}
        bordered
        scroll={{ x: 1200 }}
      />
    </>
  );
}

const toolbarContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 16,
  border: "1px solid #d6bcfa",
  background: "#f8f5ff",
  padding: "16px 20px",
  borderRadius: 12,
  marginBottom: 24,
};

const filtersRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  flex: 1,
  minWidth: 280,
};

const actionButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1677ff",
  fontSize: 16,
};
