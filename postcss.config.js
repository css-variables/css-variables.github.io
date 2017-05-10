module.exports = {
	plugins: [
		require("postcss-css-variables"),
		require("postcss-flexboxfixer"),
		require("postcss-flexbugs-fixes"),
		// require("postcss-normalize")({}),
		require("postcss-nth-child-fix"),
		require(`autoprefixer`)
	]
};