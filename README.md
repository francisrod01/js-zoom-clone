# JavaScript Zoom app clone

Projeto base da JS Expert Week 2.0

Teacher: [Erick Wendel](https://github.com/ErickWendel)
<br>
Student: [Francis Rodrigues](https://github.com/francisrod01)

- Acesse o [home](./public/pages/home/index.html) para acessar a home page
- Acesse o [room](./public/pages/room/index.html) uma room específica

- Acesse o [servidor Socket](./server/index.js)

## Screenshots

### Home Page

![home page](./prints/home.png)

### Room

![room](./prints/room.png)

### Deploying on Heroku *(optional)*

First of all you need to authenticate on heroku.

```bash
~$ npm i -g heroku

~$ heroku login
Logging in... done
Logged in as `xxxxx@xxxx.com`
```

Heroku uses GIT as a deploy source, so you must create a separated git project for each project.

```bash
~$ cd public
~$ git init
~$ ... commit all files
```

After that you'll create a heroku app for each project.

```bash
~$ heroku apps:create
Creating app... done, `xxxx-ridge-000000`
https://xxxx-ridge-000000.herokuapp.com/ | https://git.heroku.com/xxxx-ridge-000000.git

~$ heroku buildpacks:set heroku/nodejs
Buildpack set. Next release on xxxx-ridge-00000 will use heroku/nodejs.
Run `git push heroku master` to create a new release using this buildpack.
```

The last step is to push the code to heroku master.

```bash
~$ git push heroku master
```

## Créditos

- Layout da home foi baseada no codepen do [Nelson Adonis Hernandez
](https://codepen.io/nelsonher019/pen/eYZBqOm)
- Layout da room foi adaptado a partir do repo do canal [CleverProgrammers](https://github.com/CleverProgrammers/nodejs-zoom-clone/blob/master/views/room.ejs)

## License

MIT
