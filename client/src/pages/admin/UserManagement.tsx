import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select } from 'antd';
import { User } from '../../types/user.types';
import userService from '../../services/userService';
import AdminLayout from '../../layouts/AdminLayout';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (currentUser) {
        await userService.updateUser(currentUser.id, values);
      } else {
        await userService.createUser(values);
      }
      fetchUsers();
      setIsModalVisible(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentUser(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: User) => (
        <span>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.id)} danger>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="user-management">
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add User
        </Button>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
        />
        <Modal
          title={currentUser ? 'Edit User' : 'Add User'}
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
        >
          <Form
            initialValues={currentUser || {}}
            onFinish={handleModalOk}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please input the email!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select the role!' }]}
            >
              <Select>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {currentUser ? 'Update' : 'Create'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
