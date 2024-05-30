// constants to use instead of hardcoding text. Useful in if statement checks
export const sysAdmin = 'SysAdmin';
export const superAdmin = 'SuperAdmin';
export const admin = 'Admin';
export const genUser = 'User';

// Used to dynamically populate edit user role dropdown in Admin Module
export const userRolesArray = [superAdmin, admin, genUser];

// constants to keep track of each user type permissions and other variations
export const userSysAdmin = {
	permissions: ['control:sysadminModal'],
};

export const userSuperAdmin = {
	permissions: [
		'control:MEPBuilder',
		'control:adminModule',
		'control:auditLogs',
		'write:deleteUsers',
		'write:resetNonSysAdminPasswords',
		'write:resetSysAdminPassword',
		'write:editSuperAdmin',
	],
};

export const userAdmin = {
	permissions: ['control:MEPBuilder', 'control:adminModule', 'write:resetNonSysAdminPasswords'],
};

export const userGeneral = {
	permissions: ['control:MEPBuilder'],
};
