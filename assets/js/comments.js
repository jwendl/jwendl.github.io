const gitalk = new Gitalk({
    clientID: '918424798bbbf62c26c9',
    clientSecret: '5946db2d9006ac18b8c2c59427f50c0754faa320',
    repo: 'jwendl.net',
    owner: 'jwendl',
    admin: ['jwendl'],
    id: location.pathname,
    distractionFreeMode: false
})

gitalk.render('gitalk-container')
