import React, { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../../services/userService';
import { Role } from '../../types/user.types';
import AdminLayout from '../../layouts/AdminLayout';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState<string>('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const fetchedRoles = await getRoles();
    setRoles(fetchedRoles);
  };

  const handleCreateRole = async () => {
    if (newRole.trim()) {
      await createRole(newRole);
      setNewRole('');
      fetchRoles();
    }
  };

  const handleUpdateRole = async (role: Role) => {
    if (editingRole) {
      await updateRole(editingRole.id, role.name);
      setEditingRole(null);
      fetchRoles();
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    await deleteRole(roleId);
    fetchRoles();
  };

  return (
    <AdminLayout>
      <div className="role-management">
        <h1>Role Management</h1>
        <div className="create-role">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="New Role"
          />
          <button onClick={handleCreateRole}>Create Role</button>
        </div>
        <div className="roles-list">
          {roles.map((role) => (
            <div key={role.id} className="role-item">
              {editingRole && editingRole.id === role.id ? (
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                />
              ) : (
                <span>{role.name}</span>
              )}
              <button onClick={() => setEditingRole(role)}>Edit</button>
              <button onClick={() => handleDeleteRole(role.id)}>Delete</button>
              {editingRole && editingRole.id === role.id && (
                <button onClick={() => handleUpdateRole(editingRole)}>Save</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoleManagement;
