bmpUI
=====

BMP user interface is the web accessible graphical interface for the BMP plugin in ODL. 


CI - Jenkins
------------
<p style="color:brown">coming soon... </p>

Prerequisites for building
--------------------------
**Grunt** is used for build, test, and package automation.  

> #### grunt
> Similar to Maven/java but for JS.  It performs the build for the JS code, runs tests,
> and packages the code in a WAR file for deployment.  You can also use ```grunt serve``` to 
> quickly run the app locally on your machine. 

To build from source you will need to install nodejs **npm** and **grunt**.   

#### MacOS
    brew install npm

#### Ubuntu
    sudo apt-get update
    sudo apt-get install -y npm
    
#### CentOS/RHEL 7
    curl -sL https://rpm.nodesource.com/setup | bash -
    yum install -y nodejs
        
Build from source
-----------------
Some external dependancies are required, install the following only once.

    sudo gem install compass

Checkout the latest code using the following:

    git clone git@cto-github.cisco.com:CTAO-BMP/bmpUI.git
    cd bmpUI 
    
> **npm** will install everything under the current working directory **bmpUI**.
> This is being ignored by **git**, so these files will not be committed back
> to the git repo. 

Run ``sudo npm install -g grunt-cli`` to install grunt CLI.  This should install **/usr/local/bin/grunt**

Run ``npm install`` to install all the dependancies under **bmpUI**.  This will read the **package.json** file to install each dependancy.

Install bower and it's dependancies using the following:

    npm install -g bower
    bower install

### Build distribution
Run ``grunt`` to build and test.  The distribution will be under **bmpUI/dist**

If you get errors with tests, you can skip those by running ``grunt clean build``

### Build WAR file
To build the WAR file for distribution and use with tomcat run ``grunt war``.  The WAR file will be located under **bmpUI/dist_war/**
    
### Run locally
To run locally use ``grunt serve``


