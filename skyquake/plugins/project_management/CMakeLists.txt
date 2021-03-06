# RIFT_IO_STANDARD_CMAKE_COPYRIGHT_HEADER(BEGIN)
# Author(s): Kiran Kashalkar
# Creation Date: 08/18/2015
# RIFT_IO_STANDARD_CMAKE_COPYRIGHT_HEADER(END)

##
# DEPENDENCY ALERT
# The submodule dependencies must be specified in the
# .gitmodules.dep file at the top level (supermodule) directory
# If this submodule depends other submodules remember to update
# the .gitmodules.dep
##

cmake_minimum_required(VERSION 2.8)

##
# Submodule specific includes will go here,
# These are specified here, since these variables are accessed
# from multiple sub directories. If the variable is subdirectory
# specific it must be declared in the subdirectory.
##

rift_externalproject_add(
  project_management
  DEPENDS skyquake
  SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
  CONFIGURE_COMMAND echo
  BUILD_COMMAND
    ${CMAKE_CURRENT_BINARY_DIR}/project_management/project_management-build/scripts/build.sh
  INSTALL_COMMAND
    ${CMAKE_CURRENT_SOURCE_DIR}/scripts/install.sh
    ${CMAKE_CURRENT_BINARY_DIR}/project_management/project_management-build
    ${CMAKE_INSTALL_PREFIX}/usr/share/rw.ui/skyquake
    ${RIFT_SUBMODULE_INSTALL_PREFIX}/skyquake/${CMAKE_INSTALL_PREFIX}/usr/share/rw.ui/skyquake

  BCACHE_COMMAND echo
)

