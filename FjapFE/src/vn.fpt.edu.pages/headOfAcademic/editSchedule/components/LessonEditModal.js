import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Space,
  Button,
  Typography,
  Divider,
  Radio,
  Alert,
} from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const LessonEditModal = ({
  visible,
  lesson,
  rooms = [],
  timeslots = [],
  onUpdate,
  onDelete,
  onCancel,
  saving = false,
  loadedLessons = [],
  currentWeekStart = null,
}) => {
  const [form] = Form.useForm();
  const [updateMode, setUpdateMode] = useState('single'); // 'single' or 'all'

  useEffect(() => {
    if (visible && lesson) {
      form.setFieldsValue({
        date: lesson.date ? dayjs(lesson.date) : null,
        timeId: lesson.timeId ? String(lesson.timeId) : String(lesson.slot),
        roomId: lesson.roomId ? String(lesson.roomId) : null,
        updateMode: 'single',
      });
      setUpdateMode('single');
    } else {
      form.resetFields();
      setUpdateMode('single');
    }
  }, [visible, lesson, form]);

  const getWeekday = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 ? 8 : day + 1; // Monday = 2, Sunday = 8
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isSameWeek = (date1, date2) => {
    const weekStart1 = getWeekStart(date1);
    const weekStart2 = getWeekStart(date2);
    return weekStart1.getTime() === weekStart2.getTime();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newDate = values.date ? values.date.format('YYYY-MM-DD') : lesson.date;
      const updatedData = {
        date: newDate,
        timeId: parseInt(values.timeId, 10),
        roomId: parseInt(values.roomId, 10),
      };
      
      console.log('handleSubmit - lesson:', lesson);
      console.log('handleSubmit - lessonId:', lesson?.lessonId);
      console.log('handleSubmit - updatedData:', updatedData);
      console.log('handleSubmit - updateMode:', updateMode);
      
      if (!lesson?.lessonId) {
        console.error('Lesson ID is missing!', lesson);
        return;
      }

      if (updateMode === 'all') {
        // Tìm tất cả lesson cùng thứ-slot trong tuần
        const originalDate = lesson.date;
        const originalWeekday = getWeekday(originalDate);
        const originalTimeId = lesson.timeId || lesson.slot;
        const newWeekday = getWeekday(newDate);

        // Lấy tuần của lesson hiện tại (dựa vào currentWeekStart hoặc date của lesson)
        let lessonWeekStart;
        if (currentWeekStart) {
          lessonWeekStart = new Date(currentWeekStart);
          lessonWeekStart.setHours(0, 0, 0, 0);
        } else {
          lessonWeekStart = getWeekStart(originalDate);
        }

        // Tính toán tuần kết thúc
        const lessonWeekEnd = new Date(lessonWeekStart);
        lessonWeekEnd.setDate(lessonWeekEnd.getDate() + 6);
        lessonWeekEnd.setHours(23, 59, 59, 999);

        console.log('=== Batch Update Debug ===');
        console.log('Original date:', originalDate);
        console.log('Original weekday:', originalWeekday);
        console.log('Original timeId:', originalTimeId);
        console.log('New date:', newDate);
        console.log('New weekday:', newWeekday);
        console.log('Week start:', lessonWeekStart);
        console.log('Week end:', lessonWeekEnd);
        console.log('Total loadedLessons:', loadedLessons.length);

        // Tìm tất cả lesson cùng thứ-slot trong tuần đó
        const sameWeekdayLessons = loadedLessons.filter(l => {
          if (!l.date) {
            return false;
          }
          
          try {
            const lessonDate = new Date(l.date);
            lessonDate.setHours(0, 0, 0, 0);
            const lessonWeekday = getWeekday(l.date);
            const lessonTimeId = l.timeId || l.slot;
            
            // Kiểm tra xem lesson có trong tuần hiện tại không
            const isInCurrentWeek = lessonDate >= lessonWeekStart && lessonDate <= lessonWeekEnd;
            
            // Kiểm tra cùng thứ và cùng slot
            const sameWeekdayAndSlot = (
              lessonWeekday === originalWeekday &&
              parseInt(lessonTimeId) === parseInt(originalTimeId)
            );
            
            const matches = isInCurrentWeek && sameWeekdayAndSlot;

            if (matches) {
              console.log('Found matching lesson:', {
                lessonId: l.lessonId,
                date: l.date,
                weekday: lessonWeekday,
                timeId: lessonTimeId,
                isInCurrentWeek: isInCurrentWeek,
                lessonDate: lessonDate.toISOString(),
                weekStart: lessonWeekStart.toISOString(),
                weekEnd: lessonWeekEnd.toISOString()
              });
            }

            return matches;
          } catch (error) {
            console.error('Error processing lesson:', l, error);
            return false;
          }
        });

        console.log('Found lessons to update:', sameWeekdayLessons.length);
        console.log('Lessons:', sameWeekdayLessons.map(l => ({ id: l.lessonId, date: l.date, weekday: getWeekday(l.date) })));

        if (sameWeekdayLessons.length === 0) {
          console.warn('No lessons found to update!');
          console.warn('Check: Are there lessons with the same weekday and timeId in the current week?');
          console.warn('Current week range:', lessonWeekStart.toISOString(), 'to', lessonWeekEnd.toISOString());
        }

        if (onUpdate) {
          await onUpdate(lesson.lessonId, updatedData, {
            mode: 'all',
            lessonsToUpdate: sameWeekdayLessons.map(l => l.lessonId),
            newDate: newDate,
            originalWeekday: originalWeekday,
            newWeekday: newWeekday,
            weekStart: lessonWeekStart,
          });
        }
      } else {
        // Chỉ update lesson hiện tại
        if (onUpdate) {
          await onUpdate(lesson.lessonId, updatedData);
        } else {
          console.error('onUpdate callback is not provided');
        }
      }
    } catch (error) {
      console.error('Form validation or update failed:', error);
      // Error will be handled by parent component
      throw error;
    }
  };

  const handleDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('=== Delete Button Clicked ===');
    console.log('LessonEditModal handleDelete - lesson:', lesson);
    console.log('LessonEditModal handleDelete - lessonId:', lesson?.lessonId);
    console.log('LessonEditModal handleDelete - lesson type:', typeof lesson?.lessonId);
    
    if (!lesson) {
      console.error('Lesson object is missing!');
      return;
    }
    
    if (!lesson.lessonId) {
      console.error('Lesson ID is missing for delete!', lesson);
      console.error('Available lesson properties:', Object.keys(lesson));
      return;
    }
    
    const lessonId = lesson.lessonId;
    console.log('Lesson ID to delete:', lessonId, 'Type:', typeof lessonId);
    
    if (onDelete) {
      console.log('LessonEditModal calling onDelete with lessonId:', lessonId);
      try {
        onDelete(lessonId);
      } catch (error) {
        console.error('Error calling onDelete:', error);
      }
    } else {
      console.error('onDelete callback is not provided');
    }
  };

  if (!lesson) return null;

  const slotOptions = timeslots.map(ts => ({
    value: String(ts.timeId),
    label: `Slot ${ts.timeId} (${ts.startTime || ''} - ${ts.endTime || ''})`
  }));

  const roomOptions = rooms.map(room => ({
    value: room.value,
    label: room.label
  }));

  return (
    <Modal
      title="Edit Lesson"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Subject: </Text>
            <Text>{lesson.subjectCode || ''} - {lesson.subjectName || ''}</Text>
          </div>
          <div>
            <Text strong>Class: </Text>
            <Text>{lesson.className || ''}</Text>
          </div>
          <div>
            <Text strong>Lecturer: </Text>
            <Text>{lesson.lecturer || ''}</Text>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <Form.Item
            label="Update Mode"
            name="updateMode"
            rules={[{ required: true }]}
          >
            <Radio.Group 
              value={updateMode} 
              onChange={(e) => setUpdateMode(e.target.value)}
            >
              <Radio value="single">Chỉ đổi lesson này</Radio>
              <Radio value="all">Đổi tất cả lesson cùng thứ-slot trong tuần</Radio>
            </Radio.Group>
          </Form.Item>

          {updateMode === 'all' && (
            <Alert
              message="Lưu ý"
              description="Tất cả các lesson cùng thứ trong tuần và cùng slot sẽ được đổi sang ngày mới được chọn."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                // Disable dates before today
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            label="Time Slot"
            name="timeId"
            rules={[{ required: true, message: 'Please select a time slot' }]}
          >
            <Select
              placeholder="Select time slot"
              options={slotOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Room"
            name="roomId"
            rules={[{ required: true, message: 'Please select a room' }]}
          >
            <Select
              placeholder="Select room"
              options={roomOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              danger
              type="button"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(e);
              }}
              loading={saving}
              disabled={!lesson?.lessonId}
            >
              Delete Lesson
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
            >
              Save Changes
            </Button>
          </Space>
        </Space>
      </Form>
    </Modal>
  );
};

export default LessonEditModal;

