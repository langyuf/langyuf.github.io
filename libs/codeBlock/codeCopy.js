// ===== 代码块一键复制 - 精简版 =====
$(function() {
    // 为每个代码块添加复制按钮
    $('.code-area').each(function() {
        var $this = $(this);
        
        // 1. 排除行号区域
        if ($this.closest('.gutter, .line-numbers, .linenums').length > 0) {
            return;
        }
        
        // 2. 排除只包含数字的内容（行号）
        var codeText = $this.find('pre code').text().trim();
        if (/^[\d\s]+$/.test(codeText) && codeText.length < 50) {
            return;
        }
        
        // 3. 避免重复添加
        if ($this.find('.copy-btn').length > 0) {
            return;
        }
        
        // 4. 添加复制按钮
        $this.css('position', 'relative');
        var $btn = $('<button class="copy-btn">复制</button>');
        $this.append($btn);
    });
    
    // 点击复制
    $(document).on('click', '.copy-btn', function() {
        var $btn = $(this);
        var $area = $btn.closest('.code-area');
        
        // 获取代码内容
        var $code = $area.find('pre code');
        if ($code.length === 0) {
            $code = $area.find('pre');
        }
        if ($code.length === 0) {
            $code = $area.find('.highlight code');
        }
        
        var codeText = $code.text();
        
        if (!codeText || codeText.trim() === '') {
            $btn.text('无内容').css('background', '#ff4d4f');
            setTimeout(function() {
                $btn.text('复制').css('background', '');
            }, 1000);
            return;
        }
        
        // 复制功能
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(codeText)
                .then(function() {
                    $btn.text('已复制 ✓').css('background', '#52c41a');
                    setTimeout(function() {
                        $btn.text('复制').css('background', '');
                    }, 1200);
                })
                .catch(function() {
                    fallbackCopy(codeText, $btn);
                });
        } else {
            fallbackCopy(codeText, $btn);
        }
    });
    
    // 降级复制
    function fallbackCopy(text, $btn) {
        try {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            textarea.style.opacity = '0';
            textarea.setAttribute('readonly', 'readonly');
            document.body.appendChild(textarea);
            
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            
            var success = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (success) {
                $btn.text('已复制 ✓').css('background', '#52c41a');
                setTimeout(function() {
                    $btn.text('复制').css('background', '');
                }, 1200);
            } else {
                $btn.text('失败 ✗').css('background', '#ff4d4f');
                setTimeout(function() {
                    $btn.text('复制').css('background', '');
                }, 1200);
            }
        } catch (e) {
            $btn.text('失败 ✗').css('background', '#ff4d4f');
            setTimeout(function() {
                $btn.text('复制').css('background', '');
            }, 1200);
        }
    }
});