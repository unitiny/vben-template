/**
 * 组织架构 API
 * 使用 baseRequestClient 绕过响应拦截器，适配 DRF 标准格式
 */
import { useAccessStore } from '@vben/stores';

import { baseRequestClient } from '#/api/request';

import type {
  Department,
  DepartmentDetail,
  DepartmentFormData,
  DepartmentListParams,
  DepartmentTreeNode,
  Organization,
  OrganizationFormData,
  OrganizationListParams,
  OrganizationTreeNode,
  PaginatedResponse,
} from './model';

// 获取带认证的请求头
function getAuthHeaders() {
  const accessStore = useAccessStore();
  const token = accessStore.accessToken;
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

// ============ 组织 API ============

const ORG_BASE = '/organizations/';
const OrganizationApi = {
  LIST: ORG_BASE,
  TREE: `${ORG_BASE}tree/`,
} as const;

/**
 * 获取组织列表
 */
export async function getOrganizationList(params?: OrganizationListParams) {
  const response = await baseRequestClient.get<PaginatedResponse<Organization>>(
    OrganizationApi.LIST,
    { params, headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 获取组织树
 */
export async function getOrganizationTree() {
  const response = await baseRequestClient.get<OrganizationTreeNode[]>(
    OrganizationApi.TREE,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 获取组织详情
 */
export async function getOrganizationDetail(id: number) {
  const response = await baseRequestClient.get<Organization>(
    `${OrganizationApi.DETAIL}${id}/`,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 创建组织
 */
export async function createOrganization(data: OrganizationFormData) {
  const response = await baseRequestClient.post<Organization>(
    OrganizationApi.LIST,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 更新组织
 */
export async function updateOrganization(id: number, data: Partial<OrganizationFormData>) {
  const response = await baseRequestClient.put<Organization>(
    `${OrganizationApi.DETAIL}${id}/`,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 部分更新组织
 */
export async function patchOrganization(id: number, data: Partial<OrganizationFormData>) {
  const response = await baseRequestClient.patch<Organization>(
    `${OrganizationApi.DETAIL}${id}/`,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 删除组织
 */
export async function deleteOrganization(id: number) {
  await baseRequestClient.delete(`${OrganizationApi.DETAIL}${id}/`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 获取组织统计信息
 */
export async function getOrganizationStatistics(id: number) {
  const response = await baseRequestClient.get(
    `${OrganizationApi.STATISTICS}${id}/statistics/`,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 获取组织下的部门列表
 */
export async function getOrganizationDepartments(id: number) {
  const response = await baseRequestClient.get(
    `${OrganizationApi.STATISTICS}${id}/departments/`,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

// ============ 部门 API ============

const DEPT_BASE = '/departments/';
const DepartmentApi = {
  LIST: DEPT_BASE,
  TREE: `${DEPT_BASE}tree/`,
} as const;

/**
 * 获取部门列表
 */
export async function getDepartmentList(params?: DepartmentListParams) {
  const response = await baseRequestClient.get<PaginatedResponse<Department>>(
    DepartmentApi.LIST,
    { params, headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 获取部门树
 */
export async function getDepartmentTree(organizationId?: number) {
  const params = organizationId ? { organization: organizationId } : {};
  const response = await baseRequestClient.get<DepartmentTreeNode[]>(
    DepartmentApi.TREE,
    { params, headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 获取部门详情
 */
export async function getDepartmentDetail(id: number) {
  const response = await baseRequestClient.get<DepartmentDetail>(
    `${DepartmentApi.DETAIL}${id}/`,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 创建部门
 */
export async function createDepartment(data: DepartmentFormData) {
  const response = await baseRequestClient.post<Department>(
    DepartmentApi.LIST,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 更新部门
 */
export async function updateDepartment(id: number, data: Partial<DepartmentFormData>) {
  const response = await baseRequestClient.put<Department>(
    `${DepartmentApi.DETAIL}${id}/`,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 部分更新部门
 */
export async function patchDepartment(id: number, data: Partial<DepartmentFormData>) {
  const response = await baseRequestClient.patch<Department>(
    `${DepartmentApi.DETAIL}${id}/`,
    data,
    { headers: getAuthHeaders() },
  );
  return response.data;
}

/**
 * 删除部门
 */
export async function deleteDepartment(id: number) {
  await baseRequestClient.delete(`${DepartmentApi.DETAIL}${id}/`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 获取部门统计信息
 */
export async function getDepartmentStatistics(id: number) {
  const response = await baseRequestClient.get(
    `${DepartmentApi.STATISTICS}${id}/statistics/`,
    { headers: getAuthHeaders() },
  );
  return response.data;
}
