#####################################################################################
# Vagrant Development Environment for Employee Scheduling API component.            #
#                                                                                   #
# Author: Martin Micunda                                                            #
#-----------------------------------------------------------------------------------#
# Prerequisites: Virtualbox, Vagrant, Ansible                                       #
# Usage: command 'vagrant up' in the folder of the Vagrantfile                      #
#####################################################################################

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

# This Vagrant environment requires Vagrant 1.7.0 or higher.
Vagrant.require_version ">= 1.7.0"

#####################################################################################
#                             VAGRANT MAGIC BEGINS HERE                             #
#-----------------------------------------------------------------------------------#
#          For full documentation on vagrant please visit www.vagrantup.com!        #
#####################################################################################

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    # Specify the base box
    config.vm.box = "ubuntu/trusty64"

    # Couchbase Web UI port
    config.vm.network "forwarded_port", guest: 8091, host: 8091
    # Couchbase N1QL port
    config.vm.network "forwarded_port", guest: 8093, host: 8093
    # Couchbase SDK port
    config.vm.network "forwarded_port", guest: 11210, host: 11210
    # API server port
    config.vm.network "forwarded_port", guest: 3000, host: 3000

    config.vm.hostname = "employee-scheduling-api"
    config.vm.synced_folder ".", "/home/vagrant/employee-scheduling-api"

    # Provision the VirtualBoxes with Ansible
    config.vm.provision "ansible" do |ansible|
        ansible.playbook = "provision.yml"
        ansible.raw_arguments = ['-v']
    end

    # Configure VM settings for servers running in VirtualBox
    config.vm.provider "virtualbox" do |vb|
        # this is the name in the VirtualBox Manager UI
        vb.name = "employee-scheduling-api"
        # set the system memory for the virtual machine
        vb.memory = 2048
        # number of Physical CPUs to allocate
        vb.cpus = 2
    end
end
