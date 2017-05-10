import 'imports-loader?global=>window!fg-loadcss/src/loadCSS.js';

export default  function(){
	var link,links = document.getElementsByTagName( "link" );
	for( var i = 0; i < links.length; i++ ){
		link = links[ i ];
		if( link.rel === "preload" && link.getAttribute( "as" ) === "style" ){
			loadCSS( link.href, link, link.getAttribute( "media" ) );
			link.rel = null;
		}
	}
};