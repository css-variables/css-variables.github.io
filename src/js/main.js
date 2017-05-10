import './prism/prism.css';
import '../css/style.css';

const _window = window;
const document = _window.document;
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const Array = _window.Array;
Array.from = Array.from ? Array.from : a => Array.prototype.slice.call(a);

let srcEl = $('.js-src');
let outEl = $('.js-out');

$('.js-select-all').addEventListener('click', ()=>{
	if (document.createRange) {
		var rng, sel;
		rng = document.createRange();
		rng.selectNode(outEl);
		sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(rng);
	} else {
		var rng;
		rng = document.body.createTextRange();
		rng.moveToElementText(outEl);
		rng.select();
	}
});

$('.js-reset').addEventListener('click', ()=>{
	outEl.innerHTML =  srcEl.innerHTML = '';
});

let getConfig = (()=>{
	let _ch, _vars;
	$('.js-preserve').addEventListener('change',function(){
		_ch = this.checked;
	});

	$('.js-custom-variables').addEventListener('change',function(){
		let lines = this.value.split('\n');
		_vars = {};
		lines.forEach(e=>{
			let [key,val] = e.split(':');
			if(val.indexOf('!') !== -1){
				_vars[key] = {
					value: val.split('!')[0].trim(),
					isImportant: true
				};
			}else{
				_vars[key] = val;
			}
		});
	});

	return ()=>{
		return {
				preserve:_ch,
				variables: _vars ? _vars : {}
		};
	};
})();

Promise.all([
	import('./postcss/lib/postcss.es6').then((m)=>m.default),
	import('./postcss-css-variables.api.js').then((m)=>m.default)
]).then(deps=>{

	// unblock controls
	Array.from($$('[disabled]')).forEach(e=>e.removeAttribute('disabled'));

	let [postcss, cssvariables] = deps;

	let preProcessCss = (css)=>{
		var output;

		console.time('process time:');
		try {
			output = postcss([
				cssvariables(getConfig())
			]).process(css).css;
		} catch (e) {
			output = e.toString();
		} finally {
			console.timeEnd('process time:');
		}

		outEl.innerHTML = output.replace(/\</g, '&lt;').replace(/\>/g, '&gt;')

		try {
			Prism.highlightElement(srcEl);
			Prism.highlightElement(outEl);
		} catch (e) {}

	};

	let processCss = ()=>{
		preProcessCss(srcEl.value.trim());
	};

	processCss();

	srcEl.addEventListener('change', function(){
		processCss();
	});

	$('.js-submit').addEventListener('click', e=>{
		e.preventDefault();
		processCss();
	});
});



if (!(()=>{
	try {
		return document.createElement( "link" ).relList.supports( "preload" );
	} catch (e) {
		return false;
	}
})()){
	import('./cssrelpreload.js').then(m=>{
		m.default();
	});
}

