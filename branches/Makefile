##
# Usage:
#
# To build and XPI, install and run it in firefox:
# - make clean;
# - make;
# - make install;
# - make run;
#
# To build a test XPI:
# - make clean;
# - make test;
##

# The name of the extension.
extension_name := wats

# The UUID of the extension.
extension_uuid := wats@adversitement.nl

# The name of the profile dir where the extension can be installed.
profile_dir := 6ow8u1ye.default

# The zip application to be used.
ZIP := zip

# The target location of the build and build files.
bin_dir := bin

# The target XPI file.
xpi_file := $(bin_dir)/$(extension_name).xpi

# The type of operating system this make command is running on.
os_type := $(patsubst darwin%,darwin,$(shell echo $(OSTYPE)))

# The location of the extension profile.
  profile_location := \
    ~/Library/Application\ Support/Firefox/Profiles/$(profile_dir)/extensions/$(extension_uuid)

# The temporary location where the extension tree will be copied and built.
build_dir := $(bin_dir)/build

# The install.rdf file.
install_rdf := install.rdf

# The chrome.manifest file.
chrome_manifest := chrome.manifest

# The defaults dir.
defaults_dir := defaults

# The resources dir.
resources_dir := resources

# The preferences dir.
preferences_dir := $(defaults_dir)/preferences

# The chrome dir.
chrome_dir:= chrome

# The current date
current_date = $(shell date +%Y-%m-%d)

##### THIS SECTION IS FOR TESTS ######
# The target XPI file.
xpi_file_test := $(bin_dir)/$(extension_name)-test-$(current_date).xpi

# This builds the extension XPI file.
.PHONY: all
all: $(xpi_file)
	@echo
	@echo "Build finished successfully."
	@echo

##### THIS SECTION IS FOR TESTS #########
.PHONY: test
test: $(xpi_file_test)
	@echo
	@echo "Test build finished successfully."
	@echo

# This cleans all temporary files and directories created by 'make'.
.PHONY: clean
clean:
	@rm -rf $(build_dir)
	@rm -f $(xpi_file)
	@rm -f $(xpi_file_test)
	@echo "Cleanup is done."

# The includes are added after the targets because we want this file to contain
# the default (first) target.
include chrome/Makefile.in


#####################################

# The sources for the XPI file. Uses variables defined in the included
# Makefiles.
xpi_built := $(build_dir)/$(install_rdf) \
             $(build_dir)/$(chrome_manifest) \
             $(chrome_jar_file) \
             $(build_dir)/chrome/ \
             $(build_dir)/$(resources_dir)/log4moz.js \
             $(build_dir)/$(preferences_dir)/$(extension_name).js

##### THIS SECTION IS FOR TESTS ######
xpi_built_test := $(build_dir)/$(install_rdf) \
             $(build_dir)/$(chrome_manifest) \
             $(addprefix $(build_dir)/,$(jar_sources)) \
             $(build_dir)/chrome/ \
             $(build_dir)/$(resources_dir)/log4moz.js \
             $(build_dir)/$(preferences_dir)/$(extension_name).js 

xpi_built_no_dir := $(subst $(build_dir)/,,$(xpi_built))

##### THIS SECTION IS FOR TESTS ######
xpi_built_no_dir_test := $(subst $(build_dir)/,,$(xpi_built_test))

# This builds everything except for the actual XPI, and then it copies it to the
# specified profile directory, allowing a quick update that requires no install.
.PHONY: install
install: $(build_dir)
	@echo "Installing in profile folder: $(profile_location)"
	@if [ ! -x $(profile_location) ]; \
  then \
    mkdir -p $(profile_location); \
  fi
	@find $(build_dir)/ -name ".svn" | xargs rm -Rf
	@cp -Rf $(build_dir)/* $(profile_location)
	@echo "Installing in profile folder. Done!"
	@echo

# TODO: fix this before the next release
$(xpi_file): $(build_dir) $(xpi_built)
	@echo "Creating XPI file."
	@echo "../$(xpi_file_test)";
	@echo $(xpi_built_no_dir)
	@find $(build_dir)/ -name ".svn" | xargs rm -Rf
	@cd $(build_dir); $(ZIP) -r ../../$(xpi_file) $(xpi_built_no_dir)
	@echo "Creating XPI file. Done!"

##### THIS SECTION IS FOR TESTS ######
$(xpi_file_test): $(build_dir) $(xpi_built_test)
	@echo "Creating Test XPI file."
	@cp chrome.manifest $(build_dir)/chrome.manifest;
	@find $(build_dir)/ -name ".svn" | xargs rm -Rf
	@cd $(build_dir); $(ZIP) -r ../../$(xpi_file_test) $(xpi_built_no_dir_test);
	@echo "Creating Test XPI file. Done!";


$(build_dir)/$(defaults_dir)/%: $(defaults_dir)/% $(build_dir)/$(defaults_dir)
	@if [ ! -x $(dir $@) ]; \
  then \
    mkdir -p $(dir $@); \
  fi
	@cp -f $< $@

$(build_dir)/$(resources_dir)/%: $(resources_dir)/% $(build_dir)/$(resources_dir)
	@if [ ! -x $(dir $@) ]; \
  then \
    mkdir -p $(dir $@); \
  fi
	@cp -f $< $@

$(build_dir)/$(preferences_dir)/%: $(preferences_dir)/% $(build_dir)/$(preferences_dir)
	@cp -f $< $@

$(build_dir)/$(chrome_dir)/%: $(chrome_dir)/% $(build_dir)/$(chrome_dir)
	@cp -f $< $@

$(build_dir)/%: %
	@cp -f $< $@

$(build_dir):
	@if [ ! -x $(build_dir) ]; \
  then \
    mkdir -p $(build_dir); \
  fi

$(build_dir)/$(resources_dir):
	@if [ ! -x $(build_dir)/$(resources_dir) ]; \
  then \
    mkdir -p $(build_dir)/$(resources_dir); \
  fi

$(build_dir)/$(defaults_dir):
	@if [ ! -x $(build_dir)/$(defaults_dir) ]; \
  then \
    mkdir -p $(build_dir)/$(defaults_dir); \
  fi

$(build_dir)/$(preferences_dir):
	@if [ ! -x $(build_dir)/$(preferences_dir) ]; \
  then \
    mkdir -p $(build_dir)/$(preferences_dir); \
  fi

run:
	@echo Running the browser
	@/Applications/Firefox\ 3.app/Contents/MacOS/firefox-bin -no-remote -p

