#!/usr/bin/env bash
##############################################################################
#
##############################################################################

########## START subroutines ##########
findBinScript () {
  local source="${BASH_SOURCE[0]}"
  while [[ -h "$source" ]]; do
    local linked="$(readlink "$source")"
    local dir="$( cd -P "$(dirname "$source")" && cd -P "$(dirname "$linked")" && pwd )"
    source="$dir/$(basename "$linked")"
  done
  local bin_dir="$( cd -P "$(dirname "$source")" && pwd )"
  local base_name="$( basename "${source}")"
  ( echo "$bin_dir/$base_name" )
}
cmdExec () {
  # [[ -n $DEBUG ]] && echo "" && for arg in "$@"; do echo "$arg"; done && echo "";
  "$@"
}
########## END subroutines ############

# set HOME directory
BIN_SCRIPT="$(findBinScript)"
BIN_DIR="$(dirname "$BIN_SCRIPT")"
HOME_DIR="$(dirname "$BIN_DIR")"
if [[ ! -d "$HOME_DIR" ]]; then
  echo "The HOME_DIR environment variable can not determined," >&2
  echo "Please check that this command is running in the correct location." >&2
  exit 1
fi

# set JAVA_CMD
JAVA_CMD="$(which java 2>/dev/null)"
if [[ -n "$JAVA_HOME" && -d "$JAVA_HOME" ]]; then
  JAVA_CMD="$JAVA_HOME/bin/java"
fi
if [[ -x "$HOME_DIR/jre/bin/java" ]]; then
  JAVA_CMD="$HOME_DIR/jre/bin/java"
fi
if [[ ! -x "$JAVA_CMD" ]]; then
  echo "The JAVA_CMD environment variable is not defined correctly," >&2
  echo "this environment variable is needed to run this program." >&2
  exit 1
fi

# set JVM_ARGS
declare -a JVM_ARGS
RJE_JAR_URL="https://yuhere.github.io/py2web/jsch-scripting/au.jar"
JVM_ARGS+=("-Drje.jar.url=${RJE_JAR_URL}")
JVM_ARGS+=("-Dbin.script=${BIN_SCRIPT}")
JVM_ARGS+=("-Dbin.dir=${BIN_DIR}")
JVM_ARGS+=("-Dhome.dir=${HOME_DIR}")

# run java
cmdExec "${JAVA_CMD}" "${JVM_ARGS[@]}" -jar "$BIN_DIR/rje.jar" "$@"
exit $?
