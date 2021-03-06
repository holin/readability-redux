
function create_javascript(settings)
{

    if(settings['remote']) 
    {
        console.log('Using remote Readability.');

        js_url = "http://lab.arc90.com/experiments/readability/js/readability.js?x="+(Math.random());
        css_url = "http://lab.arc90.com/experiments/readability/css/readability.css";
        print_url = "http://lab.arc90.com/experiments/readability/css/readability-print.css";
    } else
    {
      if(settings.enable_experimental)
      {
          console.log('Using local, experimental Readability.');
          var js_url = chrome.extension.getURL('readability/readability-x.js');
      } else
      {
          console.log('Using local Readability.');
          var js_url = chrome.extension.getURL('readability/readability.js');
      }

      var css_url = chrome.extension.getURL('readability/readability.css');
      var print_url = chrome.extension.getURL('readability/readability-print.css');
    }

    var code = "javascript:(function(){readConvertLinksToFootnotes=" + settings['enable_links'] + ";readStyle='" + settings['style'] + "';readSize='" + settings['size'] + "';readMargin='" + settings['margin'] + "';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='" + js_url + "';document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='" + css_url + "';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='" + print_url + "';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";

    return code;
}

function render(tab)
{
    var settings = get_settings();
    console.log(settings);

    chrome.tabs.update(tab.id, { url: create_javascript(settings) });
}

function on_request(request, sender, sendResponse)
{
    if(request.type == 'render')
    {
        render(sender.tab);
        sendResponse({});
    } else if(request.type == 'get_settings')
      sendResponse(get_settings());
}
                                                                
function get_settings()
{
    function parse(x)
    {
      try
      {
        return JSON.parse(x);
      } catch(e)
      {
        return undefined;
      }
    }

    var settings = {
        style: localStorage['style'],
        size: localStorage['size'],
        margin: localStorage['margin'],
        enable_links: parse(localStorage['enable_links']),
        enable_experimental: parse(localStorage['enable_experimental']),
        enable_keys: parse(localStorage['enable_keys']),
        keys: parse(localStorage['keys'])
    };

    if(!_.isArray(settings['keys']))
        settings['keys'] = [];

    var defaults = {
        style: 'style-newspaper',
        size: 'size-large',
        margin: 'margin-wide',
        enable_links: false,
        enable_keys: false,
        enable_experimental: false,
        keys: []
    };

    _.each(defaults, function(val, key)
        {
            if(!_.include(_.keys(settings), key) || settings[key] === undefined)
            {
                settings[key] = val;
            }
        });

    return settings;
}

function set_settings(settings)
{
    if(_.include(_.keys(settings), 'enable_links'))
        settings['enable_links'] = JSON.stringify(!!settings['enable_links']);

    if(_.include(_.keys(settings), 'enable_experimental'))
        settings['enable_experimental'] = JSON.stringify(!!settings['enable_experimental']);

    if(_.include(_.keys(settings), 'enable_keys'))
        settings['enable_keys'] = JSON.stringify(!!settings['enable_keys']);

    if(_.include(_.keys(settings), 'keys'))
        settings['keys'] = JSON.stringify(settings['keys']);

    console.log('set_settings', settings);

    _.extend(localStorage, settings);

    //propagate_request({'type': 'settings_changed', 'settings': get_settings()});
}

/*function propagate_request(data)
{
  chrome.windows.getAll({populate: true}, function(windows) 
  {
    _.each(windows, function(window)
    {
      _.each(window.tabs, function(tab)
      {
        chrome.extension.sendRequest(tab.id, data);
      });
    });
     
  });
}*/

