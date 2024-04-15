module.exports =  (router) => {
  router.get('/welcome', async function (ctx, next) {
    ctx.state = {
      title: 'koa2 title'
    };
    console.log('你好')

    // await ctx.render('welcome', {title: ctx.state});
  })
}
