function getStyle(element) {
    if (!element.style)
        element.style = {};
    for (let computedStyleKey in element.computedStyle) {
        element.style[computedStyleKey] = element.computedStyle[computedStyleKey].value;
        if (element.style[computedStyleKey].toString().match(/px$/)) {
            element.style[computedStyleKey] = parseInt(element.style[computedStyleKey]);
        }
        if (element.style[computedStyleKey].toString().match(/^[0-9\.]+$/)) {
            element.style[computedStyleKey] = parseInt(element.style[computedStyleKey]);
        }
    }
    return element.style;
}

function layout(element) {
    if (!element.computedStyle) return;
    const elementStyle = getStyle(element);

    if (elementStyle.display !== 'flex') return;

    let items = element.children.filter(r => r.type === 'element');

    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    const style = elementStyle;

    ['width', 'height'].forEach(r => {
        if (style[r] === 'auto' || style[r] === '') style[r] = null;
    })

    if (!style.flexDirection || style.flexDirection === 'auto') style.flexDirection = 'row';
    if (!style.alignItems || style.alignItems === 'auto') style.alignItems = 'stretch';
    if (!style.justifyContent || style.justifyContent === 'auto') style.justifyContent = 'flex-start'
    if (!style.flexWrap || style.flexWrap === 'auto') style.flexWrap = 'nowrap';
    if (!style.alignContent || style.alignContent === 'auto') style.alignContent = 'stretch';

    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;

    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if (style.flexDirection === 'wrap-reverse') {

    }

}

module.exports = layout;
