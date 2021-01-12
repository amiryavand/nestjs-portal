import { IStorageRbac, RBAC_REQUEST_FILTER } from 'nestjs-rbac';
export const RBACstorage: IStorageRbac = {
  roles: ['admin', 'user'],
  permissions: {
    permission1: ['create', 'update', 'delete'],
    permission2: ['create', 'update', 'delete'],
    permission3: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
    permission4: ['create', 'update', 'delete'],
  },
  grants: {
    admin: ['&user', 'permission1', 'permission3'],
    user: ['permission2', 'permission1@create', 'permission3@filter1'],
  },
  filters: {},
};
