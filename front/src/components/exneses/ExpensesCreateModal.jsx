import { Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import {expensesApi, schemas} from '../../api/client.js';

const ExpensesCreateModal = ({open, onClose, onSuccess}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const expenseData = {
        expense_type: values.expense_type,
        periodicity: values.periodicity,
        description: values.description || null,
        amount: values.amount,
        actual_date: values.actual_date || null,
      };
    } catch (error) {
      message.error('Ошибка при создании расхода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Создать новый расход"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={schemas.CreateExpense}
      >
        <Input placeholder=""/>
      </Form>
    </Modal>
  );
}