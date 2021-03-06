# 
#   Copyright 2016 RIFT.IO Inc
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# Author(s): Kiran Kashalkar
# Creation Date: 08/18/2015
# 

##
# DEPENDENCY ALERT
# The submodule dependencies must be specified in the
# .gitmodules.dep file at the top level (supermodule) directory
# If this submodule depends other submodules remember to update
# the .gitmodules.dep
##

cmake_minimum_required(VERSION 2.8)

##
# DO NOT add any code before this and DO NOT
# include this file anywhere else
##
include(rift_submodule NO_POLICY_SCOPE)

##
# Submodule specific includes will go here,
# These are specified here, since these variables are accessed
# from multiple sub directories. If the variable is subdirectory
# specific it must be declared in the subdirectory.
##


##
# Include the subdirs
##
set(
  subdirs
    skyquake
  )
rift_add_subdirs(
  SUBDIR_LIST
    ${subdirs}
  )

##
# Only skyquake package contains anything
##
rift_set_component_package_fields(
  skyquake
  DESCRIPTION "RIFT.ware UI"
  POST_INSTALL_SCRIPT "${CMAKE_CURRENT_SOURCE_DIR}/postinst"
  )

##
# This macro adds targets for documentaion, unittests, code coverage and packaging
##
rift_add_submodule_targets(SUBMODULE_PACKAGE_NAME "rw.ui")
