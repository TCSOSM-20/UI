#!/bin/bash

# STANDARD_RIFT_IO_COPYRIGHT

PLUGIN_NAME=redundancy
# change to the directory of this script
PLUGIN_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source ../../../../skyquake/skyquake-build/scripts/build-plugin.sh
