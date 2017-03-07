/*
 * STANDARD_RIFT_IO_COPYRIGHT
 */
module.exports = function(Alt) {
   return Alt.generateActions(
                                       'handleUpdateInput',
                                       'handleAddProjectItem',
                                       'handleRemoveProjectItem',
                                       'handleUpdateProjectRole',
                                       'viewUser',
                                       'handleCloseUserPanel',
                                       'handleHideColumns',
                                       'getUsersSuccess',
                                       'getUsersNotification',
                                       'handleDisabledChange',
                                       'handlePlatformRoleUpdate',
                                       'handleAddUser',
                                       'handleCreateUser',
                                       'handleUpdateUser',
                                       'updateUserSuccess',
                                       'createUserSuccess',
                                       'deleteUserSuccess'
                                       );
}
