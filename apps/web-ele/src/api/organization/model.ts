/**
 * 组织架构相关类型定义
 */

// 组织类型
export type OrgType = 'headquarters' | 'subsidiary';

// 组织
export interface Organization {
  id: number;
  name: string;
  code: string;
  org_type: OrgType;
  org_type_display: string;
  parent: number | null;
  full_name: string;
  description: string;
  departments_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 组织树节点
export interface OrganizationTreeNode extends Organization {
  children: OrganizationTreeNode[];
}

// 组织列表参数
export interface OrganizationListParams {
  page?: number;
  page_size?: number;
  org_type?: OrgType;
  parent?: number | null;
  search?: string;
  ordering?: string;
}

// 创建/更新组织参数
export interface OrganizationFormData {
  name: string;
  code: string;
  org_type: OrgType;
  parent?: number | null;
  description?: string;
}

// 部门
export interface Department {
  id: number;
  name: string;
  code: string;
  organization: number;
  organization_name: string;
  organization_code: string;
  parent: number | null;
  full_name: string;
  headcount_quota: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 部门统计
export interface DepartmentStatistics {
  quota: number;
  total: number;
  regular: number;
  dispatch: number;
  usage_rate: number;
  vacancy: number;
}

// 部门详情（含统计）
export interface DepartmentDetail extends Department {
  statistics: DepartmentStatistics;
}

// 部门树节点
export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  statistics: DepartmentStatistics;
}

// 部门列表参数
export interface DepartmentListParams {
  page?: number;
  page_size?: number;
  organization?: number;
  parent?: number | null;
  search?: string;
  ordering?: string;
}

// 创建/更新部门参数
export interface DepartmentFormData {
  name: string;
  code: string;
  organization: number;
  parent?: number | null;
  headcount_quota?: number;
  description?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
