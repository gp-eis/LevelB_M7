(() => {
  const videoSource = '../assets/video/shared/solve-the-problem.mp4';
  const completionSelector = '.week-2-completion, .week-3-completion, .week-4-completion, [data-literacy-completion]';
  const upgraded = new WeakSet();

  function upgradeCompletion(completion) {
    if (!completion || upgraded.has(completion) || completion.querySelector('.activity-completion-video')) return;
    const retry = completion.querySelector('#week-2-completion-retry, .completion-retry');
    if (!retry) return;

    upgraded.add(completion);
    completion.classList.remove('week-2-completion', 'week-3-completion', 'week-4-completion');
    completion.classList.add('activity-completion-overlay');
    completion.setAttribute('role', 'dialog');
    completion.setAttribute('aria-modal', 'true');
    completion.setAttribute('aria-label', 'Activity completed');

    const frame = document.createElement('div');
    frame.className = 'activity-completion-frame';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'activity-completion-close';
    close.setAttribute('aria-label', 'Close the celebration');
    close.textContent = '×';

    const video = document.createElement('video');
    video.className = 'activity-completion-video';
    video.src = videoSource;
    video.playsInline = true;
    video.preload = 'metadata';

    const actions = document.createElement('div');
    actions.className = 'activity-completion-actions';
    retry.classList.add('pill-btn', 'blue');
    actions.appendChild(retry);
    frame.append(close, video, actions);
    completion.replaceChildren(frame);

    let wasVisible = false;
    function stopVideo() {
      video.pause();
      try { video.currentTime = 0; } catch (_) {}
    }
    function syncPlayback() {
      const visible = !completion.hidden;
      if (visible && !wasVisible) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (!visible && wasVisible) {
        stopVideo();
      }
      wasVisible = visible;
    }

    close.addEventListener('click', () => {
      stopVideo();
      completion.hidden = true;
    });
    new MutationObserver(syncPlayback).observe(completion, { attributes:true, attributeFilter:['hidden'] });
    syncPlayback();
  }

  function scan(root = document) {
    if (root instanceof Element && root.matches(completionSelector)) upgradeCompletion(root);
    root.querySelectorAll?.(completionSelector).forEach(upgradeCompletion);
  }

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof Element) scan(node);
      }));
    }).observe(document.body, { childList:true, subtree:true });
  });
})();
