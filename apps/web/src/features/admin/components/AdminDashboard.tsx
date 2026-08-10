"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, UserResponse, Organization, SystemConfig } from "../api/admin-api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "organization" | "config">("users");
  
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [configValue, setConfigValue] = useState<string>("");
  const [configKey, setConfigKey] = useState<string>("operational_config");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "users") {
        const res = await adminApi.getUsers();
        setUsers(res.data);
      } else if (activeTab === "organization") {
        const res = await adminApi.getOrganization();
        setOrganization(res.data);
      } else if (activeTab === "config") {
        const res = await adminApi.getConfig(configKey);
        setConfigValue(JSON.stringify(res.data.value, null, 2));
      }
    } catch (err: any) {
      if (err.message !== "Not Found") {
        setError(err.message || "Failed to load data");
      } else if (activeTab === "config") {
        setConfigValue("{\n  \n}"); // Default empty JSON for new config
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, configKey]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadData();
  }, [user, activeTab, loadData]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`)) return;
    try {
      await adminApi.updateUser(userId, { is_active: !currentStatus });
      await loadData();
    } catch (err: any) {
      alert("Failed to update user status");
    }
  };
  
  const changeUserRole = async (userId: string) => {
    const newRole = prompt("Enter new role (e.g., admin, responder, commander, dispatcher):");
    if (!newRole) return;
    try {
      await adminApi.updateUser(userId, { role: newRole });
      await loadData();
    } catch (err: any) {
      alert("Failed to update user role");
    }
  };

  const saveConfig = async () => {
    if (!confirm("Are you sure you want to update the system configuration?")) return;
    try {
      const parsedValue = JSON.parse(configValue);
      await adminApi.updateConfig(configKey, parsedValue);
      alert("Configuration updated successfully");
      await loadData();
    } catch (err: any) {
      alert("Invalid JSON or failed to save configuration");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="p-8 text-center text-destructive">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Administration</h1>
        <div className="flex gap-2">
          <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")}>Users</Button>
          <Button variant={activeTab === "organization" ? "default" : "outline"} onClick={() => setActiveTab("organization")}>Organization</Button>
          <Button variant={activeTab === "config" ? "default" : "outline"} onClick={() => setActiveTab("config")}>Configuration</Button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="mt-6">
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b">
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{u.role}</Badge></td>
                          <td className="px-4 py-3">
                            <Badge variant={u.is_active ? "default" : "destructive"}>
                              {u.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 space-x-2">
                            <Button variant="outline" size="sm" onClick={() => changeUserRole(u.id)}>Change Role</Button>
                            <Button 
                              variant={u.is_active ? "destructive" : "default"} 
                              size="sm" 
                              onClick={() => toggleUserStatus(u.id, u.is_active)}
                            >
                              {u.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "organization" && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organization ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Organization ID</label>
                      <Input value={organization.id} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Organization Name</label>
                      <Input value={organization.name} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Departments</label>
                      <pre className="p-4 bg-muted rounded-md overflow-auto text-sm mt-2">
                        {JSON.stringify(organization.departments, null, 2)}
                      </pre>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Editing organization details is restricted in this environment.</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Organization not found.</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "config" && (
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Configuration Key</label>
                    <Input 
                      value={configKey} 
                      onChange={(e) => setConfigKey(e.target.value)} 
                      placeholder="e.g., operational_config"
                    />
                  </div>
                  <Button variant="secondary" onClick={loadData}>Load</Button>
                </div>
                
                <div>
                  <label className="text-sm font-medium">JSON Value</label>
                  <Textarea 
                    className="font-mono mt-2" 
                    rows={15} 
                    value={configValue} 
                    onChange={(e) => setConfigValue(e.target.value)}
                    placeholder="Enter valid JSON configuration here..."
                  />
                </div>
                
                <Button onClick={saveConfig}>Save Configuration</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
