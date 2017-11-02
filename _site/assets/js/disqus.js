var disqus_config = function () {
    this.page.url = $('#page_url').val();;
    this.page.identifier = $('#page_title').val();;
};

(function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://jwendl-net-all-about-code.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
})();
