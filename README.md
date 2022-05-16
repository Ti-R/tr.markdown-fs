
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

| 			   	         	| Chrome 101 							  | Firefox 96.0.1 				|
| :-- | --: | --: |
| **markdown-fs.js (1.1.0)**	| <green>**1,076 ops/sec**</green>  ±0.59% (43 runs sampled)   | <green>**708 ops/sec**</green> +-7.81% (54 runs sampled) |
| commonmark.js	 (0.29.3)	| <orange>567 ops/sec </orange> ±0.90% (40 runs sampled) | <orange>305 ops/sec ±2.54%</orange> (52 runs sampled) |
| markdown-it.js (12.3.2)	| <orange>442 ops/sec</orange> ±1.95% (39 runs sampled) | <orange>288 ops/sec ±1.64%</orange> (53 runs sampled) |
| showdown.js	(1.9.1)	    | <red> 67.56 ops/sec </red> ±1.49% (39 runs sampled) | <red>59.25 ops/sec ±2.22%</red> (46 runs sampled) |

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



# How to use it
 - Html:
	You just need to include the file.
~~~html
	<script src="tr.markdown-fs.min.js" type="text/javascript"></script>
~~~

 - Javascript:
	Download the README.md and let Markdown decode it.

~~~javascript
	const fileToLoad = "https://raw.githubusercontent.com/Ti-R/tr.markdown-fs/main/README.md";
	
	// Get the file with jquery 
	$.get( fileToLoad, {dataType:"text"}).done( function( data ) {
		
		// Set options
		let options = {};
		
		// Filter code to remove iframe
		options.iFrameAllowed = false;
		
		// Create the object to decode to html
		const markdownFSTest = new TR.MarkdownFS(options);
		
		// Get html result from markdown
		const result = markdownFSTest.toHtml(data);
		
		// Display it
		$("#demo").html(result);
	});
~~~


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
	// Set options
	let options = {};
	
	// Set the function to call when code chapters are detected
	options.FilterCodes = function ( _code, _codeType){
		if (_codeType != '' && hljs.getLanguage(_codeType)) {
			return '<pre><code class="'+_codeType+' hljs">' + hljs.highlight(_codeType, _code).value + '</code></pre>';
		}
		
		// If no language found, do not highlight it.
		return '<pre>'+this.EscapeHtmlFct(_code)+'</pre>';
	}
	
	// Create the object to decode to html
	const markdownFS = new TR.MarkdownFS(options);
	
	// Get html result from markdown
	const resultHtml = markdownFS.toHtml(data);
~~~

Check demos/demo-highlight.html


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
	let options = {};
	
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
