/*
 * PJAX 补充：从英文页 /en/ 离开时强制整页刷新
 *
 * 界面文案（导航、侧栏卡片标题等）是 Hexo 在生成时按页面语言渲染的。
 * PJAX 只替换 #body-wrap 里的内容，换不到它外面的移动端抽屉 (#sidebar)，
 * 所以从英文页直接切回中文会出现中英混排。
 *
 * 英文站只有 /en/ 一个页面，因此从它跳到任何站内中文页面都改成整页加载，
 * 和「进入英文页」（已被 pjax.exclude 排除，同样整页加载）保持一致。
 */
;(function () {
  document.addEventListener(
    'click',
    function (e) {
      // 组合键 / 中键点击交给浏览器默认行为（新标签页打开等）
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.location.pathname.indexOf('/en/') !== 0) return

      const link = e.target && e.target.closest ? e.target.closest('a[href]') : null
      if (!link) return

      const href = link.getAttribute('href') || ''
      // 只看站内链接，且排除仍留在英文站的情况
      if (href.charAt(0) !== '/' || href.indexOf('/en/') === 0) return

      // 捕获阶段抢在 pjax 的委托监听之前，阻止它接管这次点击
      e.preventDefault()
      e.stopPropagation()
      window.location.href = link.href
    },
    true
  )
})()
