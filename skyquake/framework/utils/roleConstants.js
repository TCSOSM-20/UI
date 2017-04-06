var c = {};

c.PLATFORM = {
  OPER: "rw-rbac-platform:platform-oper",
  ADMIN: "rw-rbac-platform:platform-admin",
  SUPER: "rw-rbac-platform:super-admin"
}

c.PROJECT = {
    MANO_OPER: "rw-project-mano:mano-oper",
    MANO_ADMIN: "rw-project-mano:mano-admin",
    PROJECT_ADMIN: "rw-project:project-admin",
    PROJECT_OPER: "rw-project:project-oper",
}

module.exports = c;
