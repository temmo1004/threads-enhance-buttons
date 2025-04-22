// Threads增强按钮扩展 - 基于最新DOM结构优化版
(function() {
    // 配置
    const config = {
        // 监听间隔（毫秒）
        observerInterval: 1000,
        // 按钮文本
        buttonText: {
            notInterested: '不感興趣',
            block: '封鎖'
        },
        // CSS类名
        cssClasses: {
            buttonContainer: 'ig-enhanced-buttons-container',
            button: 'ig-enhanced-button',
            notInterestedBtn: 'not-interested-btn',
            blockBtn: 'block-btn',
            postProcessing: 'post-processing'
        }
    };

    // 主函数：开始监听DOM变化并处理贴文
    function init() {
        console.log('Threads增强按钮扩展已初始化');
        
        // 使用MutationObserver监听DOM变化
        const observer = new MutationObserver((mutations) => {
            processPosts();
        });

        // 开始观察文档变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 立即处理当前页面上的贴文
        processPosts();

        // 定期检查新贴文
        setInterval(processPosts, config.observerInterval);
    }

    // 处理所有找到的贴文
    function processPosts() {
        // 特别为Threads平台调整选择器
        const posts = document.querySelectorAll('div[data-pressable-container="true"]');
        
        posts.forEach(post => {
            // 检查此贴文是否已添加我们的按钮
            if (post.querySelector('.' + config.cssClasses.buttonContainer)) {
                return; // 已处理，跳过
            }
            
            // 找到Threads贴文的操作区域
            const moreButton = post.querySelector('svg[aria-label="更多"]');
            if (moreButton) {
                const moreButtonContainer = findClosestClickableParent(moreButton);
                if (moreButtonContainer && moreButtonContainer.parentNode) {
                    // 创建按钮容器
                    addButtonsToPost(post, moreButtonContainer.parentNode);
                }
            }
        });
    }

    // 在贴文中添加按钮
    function addButtonsToPost(post, targetElement) {
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = config.cssClasses.buttonContainer;
        
        // 创建"不感兴趣"按钮
        const notInterestedButton = document.createElement('button');
        notInterestedButton.textContent = config.buttonText.notInterested;
        notInterestedButton.className = config.cssClasses.button + ' ' + config.cssClasses.notInterestedBtn;
        
        // 添加点击处理程序
        notInterestedButton.addEventListener('click', function(e) {
            // 防止事件传播和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 添加点击样式反馈
            this.classList.add('clicked');
            this.disabled = true;
            
            console.log('不感兴趣按钮被点击');
            handleNotInterested(post);
            return false;
        });
        
        // 创建"封锁"按钮
        const blockButton = document.createElement('button');
        blockButton.textContent = config.buttonText.block;
        blockButton.className = config.cssClasses.button + ' ' + config.cssClasses.blockBtn;
        
        // 添加点击处理程序
        blockButton.addEventListener('click', function(e) {
            // 防止事件传播和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 添加点击样式反馈
            this.classList.add('clicked');
            this.disabled = true;
            
            console.log('封锁按钮被点击');
            handleBlock(post);
            return false;
        });

        // 添加按钮到容器
        buttonContainer.appendChild(notInterestedButton);
        buttonContainer.appendChild(blockButton);

        // 防止容器点击事件传播
        buttonContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // 将按钮容器插入到贴文
        if(targetElement.parentNode) {
            targetElement.parentNode.insertBefore(buttonContainer, targetElement.nextSibling);
        } else {
            post.insertAdjacentElement('afterbegin', buttonContainer);
        }
    }

    // 处理"不感兴趣"功能
    function handleNotInterested(post) {
        // 显示操作反馈
        showActionFeedback('正在执行不感兴趣操作...');
        
        // 点击菜单按钮
        const moreButton = post.querySelector('svg[aria-label="更多"]');
        if (!moreButton) {
            showActionFeedback('找不到菜单按钮');
            hidePostWithAnimation(post);
            return;
        }
        
        const moreButtonElement = findClosestClickableParent(moreButton);
        if (!moreButtonElement) {
            showActionFeedback('无法点击菜单按钮');
            hidePostWithAnimation(post);
            return;
        }
        
        // 点击"更多"按钮打开菜单
        console.log('正在点击菜单按钮');
        moreButtonElement.click();
        
        // 等待菜单加载
        setTimeout(() => {
            // 查找不感兴趣选项 - 基于最新DOM结构
            console.log('正在查找不感兴趣选项');
            
            // 方法1: 使用文本内容查找
            let notInterestedItems = Array.from(document.querySelectorAll('div[role="button"] span')).filter(
                span => span.textContent && span.textContent.trim() === '不感興趣'
            );
            
            // 方法2: 使用特定的CSS类组合
            if (!notInterestedItems.length) {
                notInterestedItems = Array.from(document.querySelectorAll('div.x1i10hfl span')).filter(
                    span => span.textContent && span.textContent.trim() === '不感興趣'
                );
            }
            
            console.log('找到不感兴趣选项数量:', notInterestedItems.length);
            
            if (notInterestedItems.length > 0) {
                // 找到第一个匹配项的可点击父元素
                const clickableOption = findClosestClickableParent(notInterestedItems[0]);
                
                if (clickableOption) {
                    // 点击不感兴趣选项
                    console.log('正在点击不感兴趣选项');
                    clickableOption.click();
                    
                    // 操作成功
                    setTimeout(() => {
                        showActionFeedback('已成功标记为不感兴趣');
                        hidePostWithAnimation(post);
                    }, 500);
                } else {
                    console.log('找不到可点击的不感兴趣选项');
                    showActionFeedback('无法点击不感兴趣选项');
                    document.body.click(); // 关闭菜单
                    hidePostWithAnimation(post);
                }
            } else {
                console.log('未找到不感兴趣选项，尝试直接查找模态对话框中的元素');
                
                // 尝试直接在文档中查找不感兴趣按钮
                const allButtons = Array.from(document.querySelectorAll('div[role="button"]'));
                const directNotInterestedButton = allButtons.find(btn => {
                    const spanText = btn.querySelector('span')?.textContent;
                    return spanText && spanText.trim() === '不感興趣';
                });
                
                if (directNotInterestedButton) {
                    console.log('找到直接的不感兴趣按钮');
                    directNotInterestedButton.click();
                    
                    setTimeout(() => {
                        showActionFeedback('已成功标记为不感兴趣');
                        hidePostWithAnimation(post);
                    }, 500);
                } else {
                    console.log('未找到任何不感兴趣选项');
                    showActionFeedback('找不到不感兴趣选项');
                    document.body.click(); // 关闭菜单
                    hidePostWithAnimation(post);
                }
            }
        }, 500); // 给菜单足够的时间加载
    }

    // 处理"封锁"功能
    function handleBlock(post) {
        // 显示操作反馈
        showActionFeedback('正在执行封锁操作...');
        
        // 点击菜单按钮
        const moreButton = post.querySelector('svg[aria-label="更多"]');
        if (!moreButton) {
            showActionFeedback('找不到菜单按钮');
            hidePostWithAnimation(post);
            return;
        }
        
        const moreButtonElement = findClosestClickableParent(moreButton);
        if (!moreButtonElement) {
            showActionFeedback('无法点击菜单按钮');
            hidePostWithAnimation(post);
            return;
        }
        
        // 点击"更多"按钮打开菜单
        console.log('正在点击菜单按钮');
        moreButtonElement.click();
        
        // 等待菜单加载
        setTimeout(() => {
            // 查找封锁选项 - 基于最新DOM结构
            console.log('正在查找封锁选项');
            
            // 方法1: 使用文本内容查找
            let blockItems = Array.from(document.querySelectorAll('div[role="button"] span')).filter(
                span => span.textContent && span.textContent.trim() === '封鎖'
            );
            
            // 方法2: 使用特定的CSS类组合
            if (!blockItems.length) {
                blockItems = Array.from(document.querySelectorAll('div.x1i10hfl span')).filter(
                    span => span.textContent && span.textContent.trim() === '封鎖'
                );
            }
            
            console.log('找到封锁选项数量:', blockItems.length);
            
            if (blockItems.length > 0) {
                // 找到第一个匹配项的可点击父元素
                const clickableOption = findClosestClickableParent(blockItems[0]);
                
                if (clickableOption) {
                    // 点击封锁选项
                    console.log('正在点击封锁选项');
                    clickableOption.click();
                    
                    // 可能需要在第二层对话框中确认封锁
                    setTimeout(() => {
                        // 尝试找到确认封锁按钮(如果存在)
                        const confirmButtons = Array.from(document.querySelectorAll('div[role="button"] span')).filter(
                            span => span.textContent && span.textContent.includes('封鎖')
                        );
                        
                        if (confirmButtons.length > 0) {
                            const confirmButton = findClosestClickableParent(confirmButtons[0]);
                            if (confirmButton) {
                                console.log('点击确认封锁按钮');
                                confirmButton.click();
                            }
                        }
                        
                        // 无论是否有确认按钮，都显示成功并隐藏贴文
                        setTimeout(() => {
                            showActionFeedback('已成功封锁此用户');
                            hidePostWithAnimation(post);
                        }, 500);
                    }, 500);
                } else {
                    console.log('找不到可点击的封锁选项');
                    showActionFeedback('无法点击封锁选项');
                    document.body.click(); // 关闭菜单
                    hidePostWithAnimation(post);
                }
            } else {
                console.log('未找到封锁选项，尝试直接查找模态对话框中的元素');
                
                // 尝试直接在文档中查找封锁按钮
                const allButtons = Array.from(document.querySelectorAll('div[role="button"]'));
                const directBlockButton = allButtons.find(btn => {
                    const spanText = btn.querySelector('span')?.textContent;
                    return spanText && spanText.trim() === '封鎖';
                });
                
                if (directBlockButton) {
                    console.log('找到直接的封锁按钮');
                    directBlockButton.click();
                    
                    // 可能需要处理确认封锁对话框
                    setTimeout(() => {
                        const confirmButtons = Array.from(document.querySelectorAll('div[role="button"] span')).filter(
                            span => span.textContent && span.textContent.includes('封鎖')
                        );
                        
                        if (confirmButtons.length > 0) {
                            const confirmButton = findClosestClickableParent(confirmButtons[0]);
                            if (confirmButton) {
                                console.log('点击确认封锁按钮');
                                confirmButton.click();
                            }
                        }
                        
                        setTimeout(() => {
                            showActionFeedback('已成功封锁此用户');
                            hidePostWithAnimation(post);
                        }, 500);
                    }, 500);
                } else {
                    console.log('未找到任何封锁选项');
                    showActionFeedback('找不到封锁选项');
                    document.body.click(); // 关闭菜单
                    hidePostWithAnimation(post);
                }
            }
        }, 500); // 给菜单足够的时间加载
    }

    // 显示操作反馈提示
    function showActionFeedback(message) {
        console.log('显示反馈:', message);
        
        // 移除任何现有的反馈
        const existingFeedback = document.querySelector('.threads-enhanced-feedback');
        if (existingFeedback) {
            document.body.removeChild(existingFeedback);
        }
        
        // 创建反馈元素
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.className = 'threads-enhanced-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // 添加到页面
        document.body.appendChild(feedback);
        
        // 显示动画
        setTimeout(() => {
            feedback.style.opacity = '1';
            
            // 2秒后淡出
            setTimeout(() => {
                feedback.style.opacity = '0';
                
                // 淡出后移除
                setTimeout(() => {
                    if (feedback.parentNode) {
                        document.body.removeChild(feedback);
                    }
                }, 300);
            }, 2000);
        }, 10);
    }

    // 使用平滑动画隐藏贴文
    function hidePostWithAnimation(post) {
        console.log('正在隐藏贴文');
        
        // 添加处理中的类名
        post.classList.add(config.cssClasses.postProcessing);
        
        // 记录原始高度
        const originalHeight = post.offsetHeight;
        
        // 设置初始过渡状态
        post.style.cssText = `
            height: ${originalHeight}px;
            overflow: hidden;
            transition: height 0.5s ease, opacity 0.5s ease, margin 0.5s ease, padding 0.5s ease;
        `;
        
        // 触发DOM回流以应用初始样式
        void post.offsetHeight;
        
        // 平滑折叠动画
        setTimeout(() => {
            post.style.height = '0px';
            post.style.opacity = '0';
            post.style.marginTop = '0px';
            post.style.marginBottom = '0px';
            post.style.paddingTop = '0px';
            post.style.paddingBottom = '0px';
            
            // 动画完成后隐藏元素
            setTimeout(() => {
                post.style.display = 'none';
            }, 500);
        }, 100);
    }

    // 查找最近的可点击父元素
    function findClosestClickableParent(element) {
        let current = element;
        let depth = 0;
        const maxDepth = 10; // 防止无限循环
        
        while (current && depth < maxDepth) {
            // 检查元素是否有role="button"或实际是button元素或可点击div
            if (current.getAttribute('role') === 'button' || 
                current.tagName === 'BUTTON' || 
                (current.tagName === 'DIV' && 
                 (current.getAttribute('tabindex') === '0' ||
                  current.className.includes('x1i10hfl')))) { // 特定于Threads的类
                return current;
            }
            current = current.parentElement;
            depth++;
        }
        return null;
    }

    // 在页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();