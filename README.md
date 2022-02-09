
# Markdown FS
Fast and Small markdown parser.

# Dependencies
 - no
 
# Aim
 - Fast
 - Small
 - Add callback to rework markdown content if need
 	- eg: Catch code to highlight it
 	- eg: hide some headings sections
 - Nice extend
 	- Video/IFrame support (Optionable)
 	- Image/Video/IFrame resize and align

# Live Demo
You can test it on my website.
[www.ti-r.com (Articles)](https://www.ti-r.com/?js/Web/Markdown)

# Speed
Markdown-FS is more than 2 time faster than the fastest and 16 time faster compare to the slower with Chrome and Firefox.

| 			   	         	| Chrome 66 							  | Firefox 96.0.1 				|
| :-- | --: | --: |
| **markdown-fs.js (1.1.0)**	| <green>**1,157 ops/sec**</green>  ±0.48% (65 runs sampled)   | <green>**708 ops/sec**</green> +-7.81% (54 runs sampled) |
| commonmark.js	 (0.29.3)	| <orange>628 ops/sec </orange> ±1.47% (64 runs sampled) | <orange>305 ops/sec ±2.54%</orange> (52 runs sampled) |
| markdown-it.js (12.3.2)	| <orange>456 ops/sec</orange> ±0.40% (63 runs sampled) | <orange>288 ops/sec ±1.64%</orange> (53 runs sampled) |
| showdown.js	(1.9.1)	    | <red> 71.02 ops/sec </red> ±1.71% (54 runs sampled) | <red>59.25 ops/sec ±2.22%</red> (46 runs sampled) |

**How the bench was made ?**

To be fair with the benchmark, the test was made on a **real** case, I took each README.md of each library on github and concatenate it inside a big file.
The speed test was to parse the 3 README.md on each run.

Check `benchmarks/benchmark.html`
Feel free to test it on your side.

# Size

Markdown-FS is about 5.5 time smaller than others in gz.
This was not took into account on benchmark test. 

| 			   	         	| Size min 	| Size min gzip  |
| :-- | --: | --: |
| **markdown-fs.js (1.1.0)**	| <green>**12 KB**</green> | <green>**4 KB**</green>|
| showdown.js	(1.9.1)	    | <orange>73 KB</orange> | <orange>22 KB</orange> |
| commonmark.js	 (0.29.3)	| <red>96 KB</red> | <orange>23 KB</orange> |
| markdown-it.js (12.3.2)	| <red>98 KB</red> | <red>30 KB</red> |



# Syntax highlighting

It is very easy to integrate highlighter.

 1) Include the file inside html, or load it from javascript
~~~html
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>
	<script>hljs.initHighlightingOnLoad();</script>
~~~

 2) Tell Markdown-FS to use it.

~~~javascript
	var options = {};
	options.FilterCodes = function ( _code, _codeType){
	    if (_codeType != '' && hljs.getLanguage(_codeType)) {
	        return '<pre><code class="'+_codeType+' hljs">' + hljs.highlight(_codeType, _code).value + '</code></pre>';
    	}
		return '<pre>'+this.EscapeHtmlFct(_code)+'</pre>';
	}
	
	var markdownFS = new TR.MarkdownFS(options);
	var resultHtml = markdownFS.toHtml(data);
~~~

Check demos/demo-highlight.html


# How to use it
 - Html:
	You just need to include the file.
~~~html
	  <script language="JavaScript" src="tr.markdown-parser.min.js"></script>
~~~

 - Javascript:
  - The library contain 2 functions

   * toHtml: to load a single js dynamically

~~~javascript
		function CallBackWhenDoneJS()
		{}
		TR.LoadJS('script1.js', CallBackWhenDoneJS);
~~~
	 
   * convertToId: to load several css and/or js dynamically
	
~~~javascript
		// TR.LoadJSAndCSS
		var tListJStoLoad  = [ 'script1.js', 'script2.js', 'script3.js' ];
		var tListCSStoLoad = [ 'link1.css', 'link2.css' ];
		
		function CallBackWhenDone()
		{}
		
		function CallBackPercentage( _percentage )
		{}
		
		// tListJStoLoad or tListCSStoLoad can be undefined
		TR.LoadJSAndCSS(tListJStoLoad, tListCSStoLoad, CallBackWhenDone, CallBackPercentage);
~~~

# Support
|Type								|Support											   |Type form								| html 																|
| :-: | :-: | :-: | :-: |
|Heading with Hash					|![Image](https://www.ti-r.com/images/general/check.png)| `#Heading 1`<br>`##Heading 2`			| `<h1>Heading 1</h1>`<br>`<h2>Heading 2 </h2>`						|
|Heading with underline				|![Image](https://www.ti-r.com/images/general/check.png)| `Heading 1`<br>`=========`<br> `Heading 2`<br>`---------`| `<h1>Heading 1</h1>`<br>`<h2>Heading 2 </h2>`		|
|Italics							|![Image](https://www.ti-r.com/images/general/check.png)| `*Italic*`<br>`_Italic_`				| `<em>rendered as italicized text</em>`								|
|Bold								|![Image](https://www.ti-r.com/images/general/check.png)| `**Bold**`<br>`__Bold__`				| `<strong>rendered as bold text</strong>`							|
|Strikethrough						|![Image](https://www.ti-r.com/images/general/check.png)| `~~Strikethrough~~`					| `<del>rendered as Striked text</del>`								|
|Link								|![Image](https://www.ti-r.com/images/general/check.png)| `[Link name](https://a.com)`			|	`<a href="https://a.com" rel="nofollow">Link name</a>`							|
|Image								|![Image](https://www.ti-r.com/images/general/check.png)| `![Alt](https://url/a.png)`				|	`<img src="https://url/a.png" alt="Alt">`							|
|Blockquotes						|![Image](https://www.ti-r.com/images/general/check.png)| `> Blockquotes` 						|	> Blockquotes							|
|Blockquotes with Markdown elements	|![Image](https://www.ti-r.com/images/general/check.png)| `> Blockquotes` 						|								|
|Blockquotes nested					|![Image](https://www.ti-r.com/images/general/check.png)| `>> Blockquotes` 						|	>> Blockquotes							|
|Horizontal Rules					|![Image](https://www.ti-r.com/images/general/check.png)| `*** or ___ or ---` 					|	*** or ___ or ---							|
|Inline HTML						|![Image](https://www.ti-r.com/images/general/check.png)| `test <br> test`						| test <br> test `test <br> test`								|


# Extend support
## Typographic replacements
| Markdown	| Html	|
| :-: | :-: |
| `(tm)` | (tm)|
| `(TM)` | (TM)|
| `->` | -> |
| `<-` | <- |
| `(c)` | (c) |
| `(C)` | (C) |
| `(r)` | (r) |
| `(R)` | (R) |
| `(p)` | (p) |
| `(P)` | (P) |
| `+-` | +- |
| `---` | --- |
| `--` | -- |

## Chekbox
| Markdown	| Html	|
| :-: | :-- |
| `[x]`	| [x] Checked |
| `[ ]`	| [ ] Unchecked |

## Align and resize a image
### Resize the image to 60px
~~~markdown
![Image](https://www.ti-r.com/images/general/check.png){width:60px}
~~~
![Image](https://www.ti-r.com/images/general/check.png){width:60px}

### Resize the image to 60px and set the image to the center
~~~markdown
![Image](https://www.ti-r.com/images/general/check.png){width:60px;text-align:center}
~~~
![Image](https://www.ti-r.com/images/general/check.png){width:60px;text-align:center}

### Resize the image to 60px width, 30px height and set the image to the right
~~~markdown
![Image](https://www.ti-r.com/images/general/check.png){width:60px;height:30px;text-align:right}
~~~
![Image](https://www.ti-r.com/images/general/check.png){width:60px;height:30px;text-align:right}


## Add video
### Insert video
~~~markdown
!v[Video](https://ti-r.com/download/videos/ET_Return.mp4)
~~~
!v[Video](https://ti-r.com/download/videos/ET_Return.mp4)

### Insert video with size and center it
~~~markdown
!v[Video](https://ti-r.com/download/videos/ET_Return.mp4){width:300px;text-align:center}
~~~
!v[Video](https://ti-r.com/download/videos/ET_Return.mp4){width:300px;text-align:center}

## Add iFrame (optionable)

Demo: `demos/demo-filter-iframe.html`

Filter code to remove iframe

~~~javascript
	var options = {};
	
	// Filter code to remove iframe
	options.iFrameAllowed = false;
~~~

### Insert iFrame
~~~markdown
!f[iFrame](https://www.youtube.com/embed/j-mk1boVuLY)
~~~
!f[iFrame](https://www.youtube.com/embed/j-mk1boVuLY)

### Insert video with specific size and center it
~~~markdown
!f[iFrame](https://www.youtube.com/embed/j-mk1boVuLY){width:480px;height:270px;text-align:center}
~~~
!f[iFrame](https://www.youtube.com/embed/j-mk1boVuLY){width:480px;height:270px;text-align:center}


# Changelog

- Version 1.1.0
	* Add extend for image resize
	* Add extend for video, iframe

- Version 1.0.0
	* Release
