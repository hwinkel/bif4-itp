Developement Information
========================

Install Play
------------
Download the latest Play zip (http://download.playframework.org/releases/play-2.0.3.zip) and extract it to your home directory. Then proceed with the install information for your operating system. 

Install Linux::

 $ sudo mv play-2.0.3/ /opt
 $ sudo chmod a+x /opt/play-2.0.3/play
 $ sudo ln -s /opt/play-2.0.3/play /usr/local/bin/play

Generate IDE Project files
--------------------------

To generate the project files for your IDE, just cd into the webchat directory and
execute the specific commands. The play commands have to be used in this directory

``Intellij IDEA``::

 $ play idea

Then go: File -> New Module -> Import Existing Module and select the generated the webchat.iml

``Eclipse``::

 $ play eclipsify


Run developement server
-----------------------
You can run the developement server with::

 $ play run
 
You can now access it on http://localhost:9000

Generate development data
-------------------------
As the project is currently pre-alpha, you have to generate standard user accounts by yourself by visiting this link
ONCE every time you start the developement server::

  http://localhost:9000/Testdata

It will ask you to generate the database in your memory. After this you can log in under 

  http://localhost:9000/

The Testusers are::

  USER:PASSWORD
  MasterLindi:test
  Glembo:test

LESS
----

LESS Files reside in the app/assets/stylesheets directory and are automatically
compiled into public/stylesheet

``LESS Information``: http://lesscss.org/


CoffeeScript
------------
CoffeeScript Files reside in the public/coffee directory and are compiled with the
script coffeecompile.sh . The script has to be launched from the same directory it is in
and automatically compiles all changes that occur in coffee files automatically.

For this to work you have to install nodejs and coffeescript

    sudo apt-get install nodejs

    sudo npm install -g coffee-script

Then launch the script with

    ./coffeecompile.sh

Now make your changes to the coffee files and simply save to start a recompile

``A reference for CoffeeScript`` is available at http://coffeescript.org/

Automatic install (with Microsoft Installer)

The http://nodejs.org/dist/latest/ directory contains the latest .msi package
(such as node-v0.6.15.msi when Node v0.6.15 was the latest) that you may use to install 
both Node.js engine and npm.

Then open a Command Prompt as Administrator and run::

    npm -g install coffee-script



Deployment
----------

You can start the Production Server with the commands::

    $ play clean compile stage
    $ ./target/start -DapplyEvolutions.default=true -Dhttp.port=80

With this commands you start a Server with Port 80 and the Model Scripts are executed automatically.

Database
----------

In our project we use 2 diffenrent DB-Systems.

For develepment we use the In-Memory-Database H2 with following configuration::

    db.default.driver=org.h2.Driver
    db.default.url="jdbc:h2:mem:play"
    # db.default.user=sa
    # db.default.password=

As you can see for this DB you do not need a User or a Password. 
If you like a GUI for the H2 Database you need the command::

    $ play h2-browser

In production we use the Mysql-Database with following configuration::

    db.default.driver=com.mysql.jdbc.Driver
    db.default.url="jdbc:mysql://localhost/itp_4?characterEncoding=UTF-8"
    db.default.user=<user>
    db.default.password=<"password">
