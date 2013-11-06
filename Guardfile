# Sass with Compass
guard 'compass', :configuration_file => 'Compass.rb'

# Sprockets for JS
guard 'sprockets', :destination => 'build', :asset_paths => ['scripts'], :minify => true, :root_file => 'source/swipster.js' do
  watch %r{source/(.+)\.js}
end

# JS Hint
guard 'jshint-node', :config => 'jshint-config.json' do
    watch %r{source/(.+)\.js}
end

# Live reload
guard 'livereload', :apply_js_live => true, :apply_css_live => true do
  watch(%r{build/(.+)\.css})
  watch(%r{build/(.+)\.js})
  watch(%r{demo/(.+)\.html})
end
