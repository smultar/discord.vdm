<p align="center">
  <img width="60" src="https://user-images.githubusercontent.com/6223536/161629507-7de0db9b-5d2b-46e8-87ca-ef84b43c288d.png">
</p>

# Discord.vdm
A **virtual direct** message handler, that mirrors a conversation with its contents between a thread and a target user's dms. Extremely useful for server ticket systems, or a personalized direct messages for client handing.

If you have any problems, please report them [here](https://github.com/smultar/discord.vdm/issues).
<p align="center">
  <img width="70%" height="auto" src="https://user-images.githubusercontent.com/6223536/161634176-fd086c1f-b04f-45db-a07e-9cbfa3aeabd3.png">
</p>


## Getting Started
Depending on how you like your tea served, `discord.vdm` comes with `docker` support out of the box. *You can run it natively as well if you please*. Now lets get down to the requirements for this project.

Its reccomended to have atleast **Node.js** version `15` and above when attempting to use `discord.vdm`. 

Now, you'll need to create an `.env` file that contains the following formats, based on how you want to run your project.

Failure to run any of the following steps, will result in the crash of the `bot`.

If you are running the project natively on **Node.js**

    # Token obtaineds from the discord developer dashboard
    DISCORD_SECRET='Token'
    
    # Login information to use with the Sqlite Database
    DB_USER=User
    DB_PASS=Password
    
    # ID of the role the bot will ping when new tickets are made.
    ROLE=76546535532434
    
    # IDs of authorized users (DANGEROUS, ONLY TRUSTED PEOPLE)
    # New entries must be split by ", " as this is split() on import.
    AUTHORS="123456787, 1234566344"

If you are running the project in a **Docker** container.

    CONTAINER_NAME=discord.vdm
    DISCORD_SECRET='Token'
    IMAGE=discord.vdm
    TAG=latest
    DB_USER=admin
    DB_PASS=password
    ROLE=987654321
    AUTHORS="123456787, 1234566344"
   

**Keep in mind.**
   All docker images are build with the internal directory of `/usr/src/${IMAGE}` or `/usr/src/discord.vdm`. 

Use this information wisely when trying to map volumes. *I already did this, but this is in case you wanted to do something fancy.*

**First Time Setup**
Once you have set up the bot, it will run in **dormant mode**, untill you run the `/ticket manage channel` command. This allows the bot to set it self up. All the other commands explain themselfs, if you read there descriptions.
