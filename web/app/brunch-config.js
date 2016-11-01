exports.config = {
	paths: {
		public: 'public',
		watched: ['client']
	},
	modules: {
		wrapper: false,
		definition: false
	},
	files: {
		javascripts: {
			joinTo: {
				'js/app.js': /^client/,
				'js/vendor.js': /^bower_components/
			},
			order: {
				before: [
					'bower_components/zepto/zepto.js',
          'bower_components/d3/d3.js'
				]
			}
		},
		stylesheets: {
			joinTo: {
				'css/app.css': /^client/
			}
		},
		templates: {
			joinTo: 'js/app.js'
		}
	},
	plugins: {
    HTMLMinifier: {
      destinationFn: function(path) {
        return path.replace(/^client[\/\\](.*)\.html$/, "$1.html");
      },
      htmlmin_options: {
        collapseWhitespace: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseBooleanAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      }
    },
    gzip: {
      paths: {
        javascript: 'js',
        stylesheet: 'css'
      }
    }
	},
  sourceMaps: true
}