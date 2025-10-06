import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Modal, Select, Spin, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import ClassListApi from "../../../api/ClassList";

const INITIAL_FORM_VALUES = {
  className: "",
  semesterId: undefined,
  levelId: undefined,
};

const mapLookupToOption = (item = {}) => ({
  value: item.id,
  label: item.name,
});

const resolveClassField = (source, fallback) => {
  if (source === null || source === undefined) {
    return fallback;
  }
  if (typeof source === "object" && "value" in source) {
    return source.value;
  }
  return source;
};

export default function ClassForm({
  type = "CREATE",
  title,
  reload,
  classId,
  classInfo,
  triggerLabel,
  triggerProps = {},
}) {
  const [form] = Form.useForm();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [options, setOptions] = useState({ semesters: [], levels: [] });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = type === "UPDATE" || type === "UPDATE_BUTTON";
  const resolvedClassId =
    classInfo?.classId ?? classInfo?.class_id ?? classId ?? null;

  const semesterOptions = useMemo(
    () => options.semesters.map((item) => mapLookupToOption(item)),
    [options.semesters]
  );

  const levelOptions = useMemo(
    () => options.levels.map((item) => mapLookupToOption(item)),
    [options.levels]
  );

  useEffect(() => {
    if (!isOpenModal) {
      return;
    }

    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const data = await ClassListApi.getFormOptions();
        setOptions({
          semesters: data?.semesters ?? [],
          levels: data?.levels ?? [],
        });
      } catch (error) {
        console.error("Failed to load class form options", error);
        message.error("Unable to load semester and level data");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isOpenModal]);

  useEffect(() => {
    if (!isOpenModal) {
      return;
    }

    if (!isEditMode) {
      form.setFieldsValue({ ...INITIAL_FORM_VALUES });
      return;
    }

    if (classInfo) {
      form.setFieldsValue({
        className: classInfo.className ?? classInfo.class_name ?? "",
        semesterId: resolveClassField(
          classInfo.semesterId ?? classInfo.semester_id,
          undefined
        ),
        levelId: resolveClassField(
          classInfo.levelId ?? classInfo.level_id,
          undefined
        ),
      });
      return;
    }

    if (!resolvedClassId) {
      return;
    }

    const loadClassInfo = async () => {
      setLoadingClass(true);
      try {
        const payload = await ClassListApi.getInfo(resolvedClassId);
        const data = payload?.data ?? payload;
        form.setFieldsValue({
          className: data?.className ?? data?.class_name ?? "",
          semesterId: resolveClassField(
            data?.semesterId ?? data?.semester_id,
            undefined
          ),
          levelId: resolveClassField(
            data?.levelId ?? data?.level_id,
            undefined
          ),
        });
      } catch (error) {
        console.error("Failed to load class info", error);
        message.error("Unable to load class information");
      } finally {
        setLoadingClass(false);
      }
    };

    loadClassInfo();
  }, [isOpenModal, isEditMode, classInfo, resolvedClassId, form]);

  const handleOpenModal = () => {
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const payload = {
      className: values.className?.trim(),
      semesterId: values.semesterId,
      levelId: values.levelId,
    };

    setSubmitting(true);
    try {
      if (isEditMode && resolvedClassId) {
        const response = await ClassListApi.update(resolvedClassId, payload);
        message.success(response?.message ?? "Class updated successfully");
      } else {
        const response = await ClassListApi.create(payload);
        message.success(response?.message ?? "Class created successfully");
      }

      handleCloseModal();
      if (typeof reload === "function") {
        reload();
      }
    } catch (error) {
      console.error("Submit class form failed", error);
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage ?? "Unable to save class information");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTriggerButton = () => {
    switch (type) {
      case "CREATE":
        return (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            {...triggerProps}
          >
            {triggerLabel ?? "Create Class"}
          </Button>
        );
      case "UPDATE":
        return (
          <Button
            type="link"
            shape="circle"
            icon={<EditOutlined />}
            onClick={handleOpenModal}
            {...triggerProps}
          >
            {triggerLabel}
          </Button>
        );
      case "UPDATE_BUTTON":
        return (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenModal}
            {...triggerProps}
          >
            {triggerLabel ?? "Edit Class"}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderTriggerButton()}
      <Modal
        open={isOpenModal}
        onCancel={handleCloseModal}
        footer={null}
        title={title}
        width={640}
        destroyOnClose
        maskClosable={false}
        closable={!(submitting || loadingClass || loadingOptions)}
      >
        <Spin spinning={loadingOptions || loadingClass}>
          <Form
            form={form}
            layout="vertical"
            initialValues={INITIAL_FORM_VALUES}
            onFinish={handleSubmit}
            autoComplete="off"
            disabled={submitting}
          >
            <Form.Item
              label="Class name"
              name="className"
              rules={[
                { required: true, message: "Class name is required" },
                { max: 100, message: "Class name must be at most 100 characters" },
              ]}
            >
              <Input placeholder="Enter class name" />
            </Form.Item>

            <Form.Item
              label="Semester"
              name="semesterId"
              rules={[{ required: true, message: "Please select semester" }]}
            >
              <Select
                placeholder="Select semester"
                options={semesterOptions}
                loading={loadingOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              label="Class level"
              name="levelId"
              rules={[{ required: true, message: "Please select class level" }]}
            >
              <Select
                placeholder="Select class level"
                options={levelOptions}
                loading={loadingOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {isEditMode ? "Update Class" : "Create Class"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}





