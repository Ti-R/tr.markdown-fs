// Renan LAVAREC - Ti-R - MIT License

// Namespace TR
if( TR == undefined )
	var TR = {};

TR.MarkdownFSGlobal = new function(){

	let tThis = this;
	
	// Debug
	tThis.Debug = false;
	
	// Create debug function
	tThis.DebugFct = function()
	{
		if( tThis.Debug )
		{
		    console.log("[Markdown] ", arguments);
		}
	}
	// Convert Tab to Space
	tThis.TabToSpace = '    ';
	
	const gBlockquoteStart = '<blockquote>';
	const gBlockquoteEnd = '</blockquote>\n';
	
	const gRegExpURLImgParam = /(\S*)\s?(\S*)/g;
	const gRegExpEscapeHtmlFct = /[<>`&]/g;
	
	tThis.gRegExpReplaceImg = /!\[(.*?)\]\((.*?)\)/g;
	tThis.gRegExpReplaceMarkDownUrl = /\[(.*)\](.*)/g;
	tThis.gRegExpReplaceUrl = /<?(https|http|ftp):\/\/([^\s<)]*?)($|[>\s<])/g;

	const gRegTable = /^\s*\|(.*)\|\s*$/;
	
	const gRegExlist = /^(\s*)[-*+](\s+)(.*)/;
	
	const gRegExlistsWithNumbers = /^(\s*)(\d+)[\.\)](\s+)(.*)/;
	
	const gNoString = '';

	const gConvertMap = {
		  '<': '&lt;',
		  '>': '&gt;',
		  '&': '&amp;',
		  '*': '&#42;',
		  '_': '&#95;',
		  '-': '&#45;',
		  '`': '&#96;'
	};
	
	tThis.EscapeHtmlFct = function EscapeHtml( _string ) {
	  return _string.replace(gRegExpEscapeHtmlFct, function (_c) {
	    return gConvertMap[_c];
	  });
	}
	const gTypographicConvertMap = {
		  'c': '&copy;',
		  'C': '&copy;',
		  'r': '&reg;',
		  'R': '&reg;',
		  'p': '&sect;',
		  'P': '&sect;',
		  'tm': '&trade;',
		  'TM': '&trade;'
	};
	
	
	// Create debug function
	let tWeightSpace = 0;
	tThis.ReturnFirstNonSpaceChar = function(_lineInfos)
	{
		_lineInfos.lineLength = _lineInfos.line.length;
		_lineInfos.NbWeightSpace = 0;
		_lineInfos.NbSpace = 0;
		_lineInfos.level = 0;
		if( _lineInfos.lineLength != 0 )
		{
			_lineInfos.needBR = 0;
			if(_lineInfos.lineLength>2)
			{
				// Need BR if end of line is 2 spaces or one slash \, if too slash, it is escape
				if((_lineInfos.line[_lineInfos.lineLength-2] == '\\') && (_lineInfos.line[_lineInfos.lineLength-3] != '\\'))
				{
					_lineInfos.needBR = 2; // Need to add BR and remove 1 char
				}

				if((_lineInfos.line[_lineInfos.lineLength-2] == ' ') && (_lineInfos.line[_lineInfos.lineLength-3] == ' ') )
				{
					_lineInfos.needBR = 3; // Need to add BR and remove 2 char
				}
					
				if((_lineInfos.line[_lineInfos.lineLength-2] == '\\') && (_lineInfos.line[_lineInfos.lineLength-3] == '\\'))
				{
					_lineInfos.needBR = -1; // Do not add br and remove one '\'
				}
			}
				
			for(let iChar=0;iChar<_lineInfos.lineLength;iChar++)
			{
				_lineInfos.firstChar = _lineInfos.line.charCodeAt(iChar);
	
				tWeightSpace = tThis.tTestSpaces[_lineInfos.firstChar];
				if( tWeightSpace != undefined)
				{
					_lineInfos.NbWeightSpace += tWeightSpace;
					if(tWeightSpace>0)
						++_lineInfos.NbSpace;
						
					if( tWeightSpace == 0 )
					{
						if( _lineInfos.NbWeightSpace>0)
							_lineInfos.level = ((_lineInfos.NbWeightSpace/4)|0)+1;

						_lineInfos.firstCharIndex = iChar;
						return;
					}
				}
				else
				{
					_lineInfos.firstCharIndex = iChar;
					return;
				}
			}
			_lineInfos.firstCharIndex = 0;
			_lineInfos.firstChar = 0;
			tWeightSpace = 0;
		}
		else
		{
			_lineInfos.firstCharIndex = 0;
			_lineInfos.firstChar = 13;
		}
	}


	tThis.UpdateWithUnderLineOrStrongOrEmFct = function UpdateWithUnderLineOrStrongOrEm(_markdownObj,  _text )
	{
		// Code before all
		_text = _text.replace(/\`+(.*?)\`+/g, function(_string, _textFound){
		
			//tThis.DebugFct("Code", _string, "_textFound",_textFound);

			_markdownObj.mListInlineCodes.push('<code>'+tThis.EscapeHtmlFct(_textFound)+'</code>');
			return '¤cod¤';
		});

		// Escape all html need to be escape by \<
		_text = _text.replace(/\\([<_*-])/g, function(_string, _c){
			return gConvertMap[_c];
		});

		// Escape < with 2 spaces
		_text = _text.replace(/\s<\s/g, function(){
			return gConvertMap['<'];
		});

		// Code escape sentence (special for display `)
		_text = _text.replace(/\`{4}(.*?)\`{4}/g, function(_string, _textFound){
		
			//tThis.DebugFct("Code", _string, "_textFound",_textFound);

			return '<code>'+tThis.EscapeHtmlFct(_textFound)+'</code>';
		});
		

		// Enable to take the style and align Image/Video/IFrame
		function FixStyleAndSpan( _style )
		{
			let tStyle = {};
			let tTextAlign = "";
			tStyle.child = "";
			tStyle.parent = "";
			if(_style && _style.length>2)
			{
				try{
					_style = _style.replaceAll(';}', '}').replaceAll(';', '","').replaceAll(':', '":"').replaceAll('{', '{"').replaceAll('}', '"}');
					tObject = JSON.parse(_style);
					if (typeof tObject["text-align"] != "undefined")
					{
						tTextAlign = ";text-align:" + tObject["text-align"];
						tStyle.parent='style="display:inline-block;width:100%'+tTextAlign+'"';
						delete tObject["text-align"];
					}
					_style = JSON.stringify(tObject).replaceAll(',', ';').replaceAll('"', '');
					tStyle.child = ' style="' + _style.substring(1, _style.length-1) + '"';
				}
				catch(e)
				{
					console.log("Parsing css to javascript object failed", _style);
				}
			}
			
			return tStyle;
		}

		// Image or Video or Iframe
		_text = _text.replace(/!(.)?\[([^\[]*?)\]\((.*?)\)({(.*?)})?/g, function( _string, _type, _text_r, _url, _style){

			//tThis.DebugFct("Image or Video or Iframe: ", _string, _type, _text_r, _url, _style);
	
			_url = _url.replace(gRegExpURLImgParam, function(_string, _url_s, _parameters){
				return _url_s;
			});

			const tStyle = FixStyleAndSpan(_style);

			if(_type == undefined){
				// Image + style
				// ![Alt text](https://img.svg "a title"){width:560px;height:350px;text-align:center}

				if(tStyle.parent != '')
					_markdownObj.mListImg.push('<span '+tStyle.parent+'><img src="'+_url+'" alt="'+_text_r+'"'+tStyle.child+'></span>');
				else
					_markdownObj.mListImg.push('<img src="'+_url+'" alt="'+_text_r+'"'+tStyle.child+'>');

				//tThis.DebugFct("Image or Video or Iframe: ", _text);
				return '¤img¤';
			}
			else if(_type == 'v'){
				// Video + style
				// !v[Alt text](https://video.mp4 "a title") or  !v[Alt text](https://video.mp4 "a title"){width:560px;height:350px;text-align:right}

				if(_text_r == gNoString)
				{
					_text_r = 'Your browser does not support the HTML5 Video element.';
				}
	
				_markdownObj.mListVid.push('<span '+tStyle.parent+'><video controls="controls" src="'+_url+'"'+tStyle.child+'>'+_text_r+'</video></span>');
				return '¤vid¤';
			}
			else if(_type == 'f'){
				
				// Video - iframe
				// !f[Alt text](https://www.youtube.com/embed/code "a title"){width:560px;height:350px}

				if(_markdownObj.mOptions.iFrameAllowed)
					_markdownObj.mListIFrame.push('<span '+tStyle.parent+'><iframe type="text/html" title="'+_text_r+'"'+tStyle.child+' src="'+_url+'?enablejsapi=1" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe></span>');
				else
					_markdownObj.mListIFrame.push('');
				return '¤ifr¤';
			}
		});
		

		// URL
		_text = _text.replace(/\[([^\[]*?)\]\((.*?)\)/g, function(_string, _text_url, _url){
			
			// url		
			//tThis.DebugFct("URL: ", "_text_url", _text_url, "_url", _url);
			let tParameters=gNoString;
			
			if(  _url && _url.length )
			{
				if(_url[0] != "#")
					tParameters = ' rel="nofollow"';
				
				let tIndexLink = _url.search(/\s/);
				if( tIndexLink != -1 )
				{
					// Search for first non white space
					tIndex = tIndexLink+1 + _url.substring(tIndexLink+1).search(/\S/);
					const tChar = _url[tIndex];

					// if not the end of the url
					if(tChar != ')')
					{
						// if the beginning of a string
						if(tChar == '"' || tChar == "'")
						{
							const tIndexEnd = tIndex+1 + _url.substring(tIndex+1).search(/["']/);
							tParameters += ' title='+_url.substring(tIndex+1, tIndexEnd);
						}
						else
						{
							tParameters += ' title="'+_url.substring(tIndex, _url.length)+'"';
						}
					}
					_url = _url.substring(0, tIndexLink);
				}
			}
			
			_markdownObj.mListUrl.push('<a href="'+_url+'"'+tParameters+'>'+_text_url+'</a>');
			return '¤url¤';
		});
		
		// Convert url	
		_text = _text.replace(tThis.gRegExpReplaceUrl/*/<?(https|http|ftp):\/\/([^\s<)]*?)([>\s<])/g*/, function(_string, _kind, _url, _space_after){
				
			//tThis.DebugFct("Convert url: ", _string, _kind, _url, _space_after);
			let tUrl = _kind+'://'+_url;
			if( _space_after == '>')
				_space_after = gNoString;
			let tParameters=gNoString;
			if( _url && _url.length && _url[0] != "#")
				tParameters=' rel="nofollow"';
			return '<a href="'+tUrl+'"'+tParameters+'>'+tUrl+' </a>'+_space_after;
		});

		// Add hr
//		_text = _text.replace(/^[\*_-]{3}[\*_-]*/g, function(_string, _prefix, _textFound){
//			return "<hr>";
//		});

		// Strong
		_text = _text.replace(/[_\*][_\*](.*?)[_\*][_\*]/g, function(_string, _textFound){
		
			//tThis.DebugFct("Strong", _string, "_textFound",_textFound);

			return '<strong>'+_textFound+'</strong>';
		});
				
		// Italic
		_text = _text.replace(/[_\*](.*?)[_\*]/g, function(_string, _textFound){
		
			//tThis.DebugFct("Italic", _string, "_textFound",_textFound);

			return '<em>'+_textFound+'</em>';
		});
				
		// Strikethrough
		_text = _text.replace(/\~~(.*?)\~~/g, function(_string, _textFound){
		
			//tThis.DebugFct("Strikethrough", _string, "_textFound",_textFound);

			return '<del>'+_textFound+'</del>';
		});

		// Typographic replacements
		_text = _text.replace(/\(([cCrRpP]|tm|TM)\)/g, function(_string, _c){
			
			//tThis.DebugFct("Typographic replacements", _c);
    		return gTypographicConvertMap[_c];
		});
		
		// Typographic replacements
		_text = _text.replace(/\+-/g, function(){
			//tThis.DebugFct("Typographic replacements +-");
    		return '&plusmn;';
		});
		
		// Fusion to 1 char
		// Typographic replacements
		_text = _text.replace(/(->|<-|---|--)/g, function(_string, _textFound){
			//tThis.DebugFct("Typographic replacements &trade;");
			if(_textFound == "<-")
    			return '&larr;';
    		else
			{
				if(_textFound == "->")
					return '&rarr;';
				else if(_textFound.length == 3)
					return "&mdash;";
				else
					return "&ndash;";
			}
		});
		
		
		// Checkbox
		_text = _text.replace(/\[([x| ])\]/g, function(_string, _c){
			//tThis.DebugFct("Typographic replacements &trade;");
			let tChecked = 'checked ';
			if( _c == ' ')
				tChecked = gNoString; 
    		return '<input type="checkbox" '+tChecked+'disabled>';
		});
				
		// Image later reference
		_text = _text.replace(/(!?)\[(.*?)\]\s?\[(.*?)\]/g, function(_string, _img, _linkName, _refName){

			if( _refName.length == 0)
				_refName = _linkName;
			_refName = _refName.toLowerCase();
			
			if( _markdownObj.mImageReferences[_refName] == undefined )
			{
				return _img + "[" + _linkName + "][" + _refName + "]";
			}

			
			let tImageRefInfos = _markdownObj.mImageReferences[_refName];
			if( _img == "!")
			{
    			return '<img src="'+tImageRefInfos.link+'" alt="'+tImageRefInfos.title+'">';
			}
    			
			let tParameters=gNoString;
			let _url =tImageRefInfos.link;
//			if( _url && _url.length && _url[0] != "#")
//				tParameters=' rel="nofollow"';
				
			if( tImageRefInfos.title != gNoString)
				tParameters+=' title="'+tImageRefInfos.title+'"';

    		return '<a href="'+_url+'"'+tParameters+'>'+_linkName+'</a>';
		});
		
		// Replace ¤\n¤
		_text = _text.replaceAll("\n", '');
			
		// Replace ¤cod¤
		let tIndexCode = 0;
		let tIndexPre = 0;
		let tIndexUrl = 0;
		let tIndexSeparatorPrevious = 0;
		let tIndexSeparator = _text.indexOf('¤');

		let tTextResult = '';
		while( tIndexSeparator>-1)
		{
			let tMatch = _text.substring(tIndexSeparator+1, tIndexSeparator+4);
			tTextResult += _text.substring(tIndexSeparatorPrevious, tIndexSeparator);
			
			tIndexSeparatorPrevious = tIndexSeparator;
			
			if(tMatch == 'cod') { tTextResult += _markdownObj.mListInlineCodes[tIndexCode++]; tIndexSeparatorPrevious+=5; }
			else if(tMatch == 'pre') { tTextResult += _markdownObj.mListCodes[tIndexPre++]; tIndexSeparatorPrevious+=5; }
			else if(tMatch == 'url') { tTextResult += _markdownObj.mListUrl[tIndexUrl++]; tIndexSeparatorPrevious+=5; }
			
			tIndexSeparator = _text.indexOf('¤', tIndexSeparator+5);
		}
		tTextResult += _text.substring(tIndexSeparatorPrevious, _text.length);
		_text = tTextResult;
		
		let tIndexImg = 0;
		let tIndexVid = 0;
		let tIndexIFr = 0;
		
		tIndexSeparatorPrevious = 0;
		tIndexSeparator = _text.indexOf('¤');
		tTextResult = '';
		while( tIndexSeparator>-1)
		{
			let tMatch = _text.substring(tIndexSeparator+1, tIndexSeparator+4);
			tTextResult += _text.substring(tIndexSeparatorPrevious, tIndexSeparator);
			
			tIndexSeparatorPrevious = tIndexSeparator;
			
			if(tMatch == 'img') { tTextResult += _markdownObj.mListImg[tIndexImg++]; tIndexSeparatorPrevious+=5; }
			else if(tMatch == 'vid') { tTextResult += _markdownObj.mListVid[tIndexVid++]; tIndexSeparatorPrevious+=5; }
			else if(tMatch == 'ifr') { tTextResult += _markdownObj.mListIFrame[tIndexIFr++]; tIndexSeparatorPrevious+=5; }
			
			tIndexSeparator = _text.indexOf('¤', tIndexSeparator+5);
		}
		tTextResult += _text.substring(tIndexSeparatorPrevious, _text.length);
		_text = tTextResult;

		
		return _text;
	}
	
	tThis.EndBlockquoteIfNeedFct = function(_markdownObj)
	{
//		tThis.DebugFct("EndBlockquoteIfNeedFct");
	//	if( _markdownObj.tWasInBlockquote )
	if( _markdownObj.tCurrentBlockLevel>0)
		{
	//		_markdownObj.tWasInBlockquote = false;
	
			//let tUpdate = true;
			do
			{
				if( _markdownObj.tCurrentBlockText != "")
				{
					_markdownObj.tHtml += '<p>';
					tThis.AddCurrentBlockTextFct(_markdownObj, '</p>' + gBlockquoteEnd);
				}
				else
				{
					tThis.AddCurrentBlockTextFct(_markdownObj,gBlockquoteEnd);
				}
			//	tUpdate = false;
			}
			while(--_markdownObj.tCurrentBlockLevel>0);
		}
	}
	
	// End the table if need
	tThis.EndTableIfNeedFct = function EndTableIfNeed(_markdownObj)
	{
		if( _markdownObj.tStartTable )
		{
			//tThis.DebugFct("EndTableIfNeedFct", "_markdownObj.tCurrentBlockText", _markdownObj.tCurrentBlockText);
			_markdownObj.tStartTable = 0;
			tThis.AddCurrentBlockTextFct(_markdownObj,'</tbody></table>', false);
		}
	}
		
/*	tThis.EndChapterFct = function EndChapter()
	{
	
		if( tThis.tClosedItemsLevel!=-1 )
		{
			tThis.CloseAllListsFct(tThis, 0);
		}
		
		// If not a new chapter close the previous one
//		if( tThis.tStartChapter )
//		{
//			tThis.tHtml += '</p>';
//			tThis.tStartChapter = false;
//		}
	}*/
	tThis.AddCurrentBlockTextFct = function AddCurrentBlockText(_markdownObj, _extraText, _updateText)
	{
		_markdownObj.tHtml += _markdownObj.tCurrentBlockText;
//		tThis.DebugFct('> HTML : AddCurrentBlockTextFct : ',_markdownObj.tCurrentBlockText);
		
		if( _extraText != undefined )
		{
			_markdownObj.tHtml += _extraText;
//			tThis.DebugFct('> HTML : AddCurrentBlockTextFct : ',_extraText);
		}
		_markdownObj.tCurrentBlockText= "";
	}
	
	tThis.EmptyLine = function (_markdownObj, _lineInfos)
	{
				//tGlobal.DebugFct("Empty line", "tThis.tStartCode", tThis.tStartCode, "tLineInfos.NbSpace",tLineInfos.NbSpace, "tThis.tWasStartCode", tThis.tWasStartCode, "tThis.tStartListOL", tThis.tStartListOL, "tThis.tStartListUL", tThis.tStartListUL, "tThis.tCurrentBlockText", tThis.tCurrentBlockText);
	
			// End all list
/*			if( tLineInfos.NbSpace == 0 )
			{
				tGlobal.CloseAllListsFct(tThis, 0);
			}*/
			

			if( _markdownObj.tStartCode )
			{
				_markdownObj.tCurrentBlockText += '\n';
			}
/*
			if( _markdownObj.tWasInBlockquote )
			{
				//_markdownObj.tCurrentBlockText += '</p><p>';
			}
			else
			{
			//	if( !tThis.tWasStartCode)
				{
				//	if( !_markdownObj.tStartCode && _markdownObj.tCurrentBlockText != "")
				//	{
				//		_markdownObj.tHtml += '<p>';
				//		tThis.AddCurrentBlockTextFct(_markdownObj, '</p>\n');
				//	}
				}
			}*/
			/*else
			{
				tGlobal.EndBlockquoteIfNeedFct(tThis);
			}*/
			
	

	/*		else
			{
				tThis.tWasStartCode = false;
			}*/
	
	}
	
	// Blockquote
	tThis.BlockquoteFct = function Blockquote(_markdownObj, _lineInfos)
	{
		//tThis.DebugFct("Blockquote6");

		//if( _markdownObj.tTestChar[_lineInfos.firstChar] == _markdownObj.MatchBlockquoteIndex)
		{
			let tCount = 0;
			//_markdownObj.tWasInBlockquote = false;
			do
			{
				let tResult = (/^\s*\>\s*(.*)/).exec(_lineInfos.line);
				if( tResult == null )
				{
					break;
				}
				else
				{
					_lineInfos.line = tResult[1];
					
					++tCount;
				}
			}while(1);
		
			if( tCount>0 )
			{		
					_markdownObj.tWasInBlockquote = true;	
			//	_markdownObj.tCurrentFct = tThis.BlockquoteFct;
					
					//tThis.DebugFct("Blockquote3", "_markdownObj.tCurrentBlockLevel", _markdownObj.tCurrentBlockLevel, "tCount", tCount);
				// Begin blockquote
				if( (tCount-_markdownObj.tCurrentBlockLevel ) > 0)
				{
					for(;_markdownObj.tCurrentBlockLevel<tCount; ++_markdownObj.tCurrentBlockLevel)
					{
						tThis.AddCurrentBlockTextFct(_markdownObj, gBlockquoteStart);
					}
				}
				else
				{
					// End blockquote
					if( (_markdownObj.tCurrentBlockLevel-tCount ) > 0)
					{
						for(;_markdownObj.tCurrentBlockLevel>tCount; --_markdownObj.tCurrentBlockLevel)
						{
							tThis.AddCurrentBlockTextFct(_markdownObj, gBlockquoteEnd);
						}
					}
				}
					
				tThis.ReturnFirstNonSpaceChar(_lineInfos);
				_markdownObj.parseAgain = true;
					//tThis.DebugFct("Blockquote2", "_markdownObj.tCurrentBlockLevel", _markdownObj.tCurrentBlockLevel, "_lineInfos.line", _lineInfos.line, "_lineInfos.firstChar", String.fromCharCode(_lineInfos.firstChar), _lineInfos.firstChar);
				return false; // return false to continue to parse and decode markdown language
			}
		}
		//tThis.EndBlockquoteIfNeedFct(_markdownObj);
		//			return false
		//return false;
		//tThis.DebugFct("Blockquote7");
		if( _markdownObj.tWasInBlockquote)
		{
			//tGlobal.DebugFct("tFunctions != undefined + BlockquoteCloseFct", "tLineInfos.firstChar", tLineInfos.firstChar, "tGlobal.BlockquoteCodeChar", tGlobal.BlockquoteCodeChar);
			tThis.BlockquoteCloseFct(_markdownObj, _lineInfos);
		}
	}
	
	// Blockquote
	tThis.BlockquoteCloseFct = function BlockquoteClose(_markdownObj, _lineInfos)
	{
		tThis.MatchCodeWithSpaceCloseFct(_markdownObj, _lineInfos);
		tThis.EndBlockquoteIfNeedFct(_markdownObj);
	}
	
	// Code
	tThis.MatchCodeFct = function MatchCode(_markdownObj, _lineInfos)
	{
		//tThis.DebugFct("tThis.MatchCodeFct", _markdownObj, _lineInfos);
		if(_lineInfos.line != gNoString)
		{
			let tResult = (/(```|~~~)(.*)/).exec(_lineInfos.line);
			if( tResult != null )
			{
				//tThis.DebugFct("tThis.MatchCodeFct", '_markdownObj.tStartCode', _markdownObj.tStartCode);
			
				// tResult[1] -> _code_prefix
				// tResult[2] -> _code
			
				if( !_markdownObj.tStartCode )
				{
					_markdownObj.tStartCode = true;
	//					tThis.AddCurrentBlockTextFct(_markdownObj,_markdownObj.mOptions.FilterCodesBefore('<pre>', _codeType));
	//					_markdownObj.tCurrentBlockText = '<pre>'
					tThis.AddCurrentBlockTextFct(_markdownObj);
					_markdownObj.tLastBlockCodeType = tResult[2];
	//				_markdownObj.tCurrentFct = undefined;
				}
				else
				{
					_markdownObj.tStartCode = false;
	//					_markdownObj.tWasStartCode = true;
					//_markdownObj.tCurrentBlockText = tThis.EscapeHtmlFct(_markdownObj.tCurrentBlockText);
					_markdownObj.tCurrentBlockText = _markdownObj.mOptions.FilterCodes.call(tThis, _markdownObj.tCurrentBlockText, _markdownObj.tLastBlockCodeType);
					
					_markdownObj.mListCodes.push(_markdownObj.tCurrentBlockText);
					_markdownObj.tCurrentBlockText = '¤pre¤\n';
					tThis.AddCurrentBlockTextFct(_markdownObj);
					//tThis.AddCurrentBlockTextFct(_markdownObj, _markdownObj.mOptions.FilterCodesAfter('</pre>', _markdownObj.tLastBlockCodeType), false);
				}
				return true;
			}
		}
		
		return false;
	}
	
	// Code
	tThis.MatchCodeWithSpaceFct = function MatchCodeWithSpace(_markdownObj, _lineInfos)
	{
		//if( tThis.tTestChar[_lineInfos.firstChar] == tThis.MatchCodeIndex)

		//tThis.DebugFct("MatchCodeWithSpaceFct", "_lineInfos.NbWeightSpace", _lineInfos.NbWeightSpace, "_markdownObj.tCurrentNbWeightSpace", _markdownObj.tCurrentNbWeightSpace);

		if( (_lineInfos.NbWeightSpace-_markdownObj.tCurrentNbWeightSpace) >= 4 )
		{
			let tSpace = _markdownObj.tCurrentNbWeightSpace+4;
			//tThis.DebugFct("MatchCodeWithSpaceFct2", "_lineInfos.NbWeightSpace", _lineInfos.NbWeightSpace ,"tLineInfos.line", _lineInfos.line, '^[ ]{' +  (tSpace).toString() + '}([^-\\*].*)');

			_lineInfos.line = _lineInfos.line.replace(/\t/g, tThis.TabToSpace);
			//let tRegex = '^([ ]{' +  (tSpace).toString() + '}|[\\t]{'+(tSpace/4).toString()+'})([^-\\*].*)');
			/*let tRegex = '^[ ]{' +  (tSpace).toString() + '}([^-\\*].*)');
			let tResult = tRegex.exec(_lineInfos.line);
			//tThis.DebugFct("Code with space1", tResult);
			if( tResult != null )*/
			
			{
				// tResult[1] -> _space_prefix
				// tResult[2] -> _code
				
				//tThis.DebugFct("Code with space", "_lineInfos.line", _lineInfos.line, "_markdownObj.tCurrentBlockText", _markdownObj.tCurrentBlockText, tResult[1], tResult[2]);
				
				if( !_markdownObj.tStartCodeWithSpace )
				{
					_markdownObj.tStartCodeWithSpace = true;
					tThis.AddCurrentBlockTextFct(_markdownObj);
				}
				
				//_markdownObj.tCurrentBlockText += tResult[1] + "\n";
				_markdownObj.tCurrentBlockText += _lineInfos.line.slice(tSpace, _lineInfos.line.length) + '\n';

//				_markdownObj.tCurrentFct = MatchCodeWithSpace;
				return true;
			}
		}
		//tThis.DebugFct("MatchCodeWithSpaceFct->close");
		tThis.MatchCodeWithSpaceCloseFct(_markdownObj, _lineInfos);
		
		return false;
	}

	// Code
	tThis.MatchCodeWithSpaceCloseFct = function MatchCodeWithSpaceClose(_markdownObj, _lineInfos)
	{
		if( _markdownObj.tStartCodeWithSpace )
		{
			//tThis.DebugFct("Close Code with space", "_markdownObj.tCurrentBlockText", _markdownObj.tCurrentBlockText);
			
			_markdownObj.tStartCodeWithSpace = false;
	//				_markdownObj.tWasStartCode = true;
	//				_markdownObj.tCurrentBlockText = tThis.EscapeHtmlFct(_markdownObj.tCurrentBlockText);
			_markdownObj.tCurrentBlockText = _markdownObj.mOptions.FilterCodes.call(tThis, _markdownObj.tCurrentBlockText, gNoString);
		
			_markdownObj.mListCodes.push(_markdownObj.tCurrentBlockText);
			_markdownObj.tCurrentBlockText = '¤pre¤\n';
			tThis.AddCurrentBlockTextFct(_markdownObj);
			//tThis.AddCurrentBlockTextFct(_markdownObj, _markdownObj.mOptions.FilterCodesAfter('</pre>', ''), false);
		}
	}
	
	// Titles underlines
	tThis.TitlesUnderlinesFct = function TitlesUnderlines(_markdownObj, _lineInfos)
	{
		let tResult = (/^[=-]{3}[=-]+/).test(_lineInfos.line);
		if( tResult )
		{
			
			//tThis.DebugFct("Titles", _lineInfos.line[0]);
			// End chapter if need 
//			tThis.CloseAllListsFct(_markdownObj, 0);
			//_markdownObj.EndChapterFct();
			
			if( _lineInfos.line[0] == '=')
			{
				_markdownObj.tHtml += '<H1>';
				tThis.AddCurrentBlockTextFct(_markdownObj,'</H1>\n');
			}
			else if( _lineInfos.line[0] == '-')
			{
				_markdownObj.tHtml += '<H2>';
				tThis.AddCurrentBlockTextFct(_markdownObj,'</H2>\n');
			}
			
			return true;
		}
		
		return false;
	}
		
	
	// Title
	tThis.TitleFct = function Title(_markdownObj, _lineInfos)
	{

		let tResult = (/^\s*(#+)\s+([^#]*)(#*)/).exec(_lineInfos.line);
		if( tResult != null )
		{
			// tResult[1] -> _prefix
			// tResult[2] -> _titleFound
			
//			tThis.CloseAllListsFct(_markdownObj, 0);
			
			tResult[2] = tResult[2].trim();
			//tThis.DebugFct("Title", "_prefix", tResult[1], "_titleFound", tResult[2]);
						
			
			//_markdownObj.EndChapterFct();
			
			// End table if need (need to be done if this line execute before table, need to end the table)
//				tThis.EndTableIfNeedFct(tThis);
						
			if( !_markdownObj.tClosedItems && (_lineInfos.NbWeightSpace < _markdownObj.tCurrentNbWeightSpace || (_lineInfos.NbWeightSpace == 0)))
			{		
//				tThis.DebugFct("CloseAllListsFct 30");
				tThis.CloseAllListsFct(_markdownObj, _lineInfos.NbWeightSpace);
				//tThis.tCurrentNbWeightSpace = tLineInfos.NbWeightSpace;
			}

			// Start a new chapter (tResult[0] -> prefix)
			let tHeaderlevel = tResult[1].length;
			
			let tOptions = {};
			tOptions.ShowChapter = true;

			let tChapter = _markdownObj.mOptions.FilterHeadingSections.call(_markdownObj, tHeaderlevel, tResult[2], tOptions);
			
			_markdownObj.tShowCurrentChapter = tOptions.ShowChapter;
			
			if( tOptions.ShowChapter == true )
			{
				tThis.AddCurrentBlockTextFct(_markdownObj, tChapter);
				_markdownObj.tStartChapter = true;
			}
			else
			{
//					_markdownObj.tCurrentFct = tThis.TitleFct;
			}

			return true;
		}
		
		return false;
	}
	
	// Table
	tThis.TableFct = function Table(_markdownObj, _lineInfos)
	{
		let tResult = gRegTable.exec(_lineInfos.line);
		if( tResult != null )
		{
			// tResult[1] -> _tableLine
			
			//tThis.DebugFct("Table", "_tableLine", tResult[1], "_markdownObj.tStartTable", _markdownObj.tStartTable);

			// If table not started
			if( _markdownObj.tStartTable == 0)
			{
				// start table header
				tThis.AddCurrentBlockTextFct(_markdownObj,'<table><thead><tr>');
			}
			else
			{
				// start row
				tThis.AddCurrentBlockTextFct(_markdownObj,'<tr>');
			}
			//tThis.DebugFct("Table after add", "_markdownObj.tCurrentBlockText", _markdownObj.tCurrentBlockText);
			
			let tContinueWithCellText = false;
			let tCells = tResult[1].split('|');
			
			for(let iCell=0;iCell<tCells.length;iCell++ )
			{
				let tTextCell = tCells[iCell];
				tTextCell = tTextCell.trim();
				
				// If table didn't start "yet", it is the header of the table
				if( _markdownObj.tStartTable == 0)
				{
					_markdownObj.tHtml += "<th>";
					_markdownObj.tCurrentBlockText += tTextCell;
					tThis.AddCurrentBlockTextFct(_markdownObj,'</th>');
				}
				else
				{
					if(_markdownObj.tStartTable==1)
					{
						// Check if this is a table alignement
						tTextCell.replace(/^(:*)-+(:*)$/, function(_string, _alignLeft, _alignRight){
							if( _alignLeft != "")
							{
								if( _alignRight != "" )
									_markdownObj.tTableAligns[iCell] = 0; // Center
								else
									_markdownObj.tTableAligns[iCell] = 1; // Left
							}
							else
							{
								if( _alignRight != "" )
									_markdownObj.tTableAligns[iCell] = 2; // Right
								else
									_markdownObj.tTableAligns[iCell] = 3; // default do nothing
							}
							tContinueWithCellText = true;
						});
						// If table alignment, continue to another cell
						if( tContinueWithCellText )
							continue;
					}
					
		
					// Add text alignment
					let tStyle = "";
					if( _markdownObj.tTableAligns[iCell] == 0)
					{
						tStyle = ' style="text-align:center;"';
					}
					else
					{
						if( _markdownObj.tTableAligns[iCell] == 1)
						{
							tStyle = ' style="text-align:left;"';
						}
						else
						{
							if( _markdownObj.tTableAligns[iCell] == 2)
							{
								tStyle = ' style="text-align:right;"';
							}
						}
					}
					
					// Add text
					_markdownObj.tHtml += "<td"+ tStyle + ">";
					_markdownObj.tCurrentBlockText += tTextCell;
					tThis.AddCurrentBlockTextFct(_markdownObj,'</td>');
				}
			}

			if( _markdownObj.tStartTable == 0 )
			{
				// end table header
				_markdownObj.tHtml += "</tr></thead><tbody>";
				_markdownObj.tStartTable = 1;
			}
			else
			{
				_markdownObj.tStartTable = 2;
				// end row
				tThis.AddCurrentBlockTextFct(_markdownObj,'</tr>');
			}
			
			_markdownObj.tCurrentFct = tThis.TableFct;
			return true;
		}
			
		tThis.EndTableIfNeedFct(_markdownObj);
		
		return false;
	}
	
	// End the table if need
	tThis.EndTableIfNeedFct = function EndTableIfNeed(_markdownObj)
	{
		if( _markdownObj.tStartTable>0 )
		{
			//tThis.DebugFct("EndTableIfNeedFct", "_markdownObj.tCurrentBlockText", _markdownObj.tCurrentBlockText);
			_markdownObj.tStartTable = 0;
			tThis.AddCurrentBlockTextFct(_markdownObj,'</tbody></table>', false);
		}
	}
	
	// Itemized lists	
	tThis.ItemizedlistsTestFct = function(_markdownObj, _lineInfos)
	{	
		let tResult = gRegExlist.exec(_lineInfos.line);
		if( tResult != null )
		{
			return true;
		}
		return false;
	}
	
	// Itemized lists	
	tThis.ItemizedlistsFct = function Itemizedlists(_markdownObj, _lineInfos)
	{	
		let tResult = gRegExlist.exec(_lineInfos.line);
		if( tResult != null )
		{
			// tResult[1] -> _spaces_before
			// tResult[2] -> _spaces_after
			// tResult[3] -> _textFound
		/*	if(_lineInfos.level == 0)
				++_lineInfos.level;*/
			_markdownObj.tClosedItems = false;
			
			_lineInfos.NbWeightSpace -= 1;
			_lineInfos.NbWeightSpace += tResult[2].length;
			let tCloseList = false;
			

//			tThis.DebugFct("tThis.ItemizedlistsFct", "_markdownObj.tCurrentLevel", _markdownObj.tCurrentLevel, "_lineInfos.NbWeightSpace",_lineInfos.NbWeightSpace, "_markdownObj.tCurrentNbWeightSpace", _markdownObj.tCurrentNbWeightSpace);


			if( _lineInfos.NbWeightSpace>_markdownObj.tCurrentNbWeightSpace )
			{
				_markdownObj.tCurrentNbWeightSpace = _lineInfos.NbWeightSpace;
				//++_markdownObj.tCurrentLevel;
				
				//_markdownObj.tCurrentLevel = _lineInfos.level;
				if( (_markdownObj.tCurrentNbWeightSpace+1) > _markdownObj.mCurrentLevelMaxForItemizedlists)
					_markdownObj.mCurrentLevelMaxForItemizedlists = _markdownObj.tCurrentNbWeightSpace+1;
			}
			else if( _lineInfos.NbWeightSpace<_markdownObj.tCurrentNbWeightSpace )
			{
				tCloseList = true;
					//if( _lineInfos.level < _markdownObj.tCurrentLevel)

				_markdownObj.tCurrentNbWeightSpace = _lineInfos.NbWeightSpace;
				//--_markdownObj.tCurrentLevel;
			}
			//tThis.DebugFct("tThis.ItemizedlistsFct2", "_lineInfos.NbWeightSpace", _lineInfos.NbWeightSpace);

			// 0x800 - close <ol>
			if( _markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace]&0x800 || tCloseList)
			{
				//tThis.DebugFct("CloseAllListsFct 4");
				tThis.CloseAllListsFct(_markdownObj, _lineInfos.NbWeightSpace);
			}
				
			/*if( tResult[1] )
				_markdownObj.tCurrentLevel = tResult[1].length;
				
			if( _markdownObj.tCurrentLevel == 0 )
				_lineInfos.NbWeightSpace = _lineInfos.NbSpace = tResult[2].length+1;*/
						
//			tThis.CloseAllListsFct(_markdownObj, _markdownObj.tCurrentLevel);
			

			// New data to this level
			if( _markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace] == 0 )
			{
				_markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace] = 0x8000/*|_markdownObj.tCurrentNbWeightSpace*/;
//				_markdownObj.tStartListUL = true;
				_markdownObj.tHtml += '<ul>\n';
			}
			else
			{
				_markdownObj.tCurrentBlockText += '</li>\n';
				tThis.AddCurrentBlockTextFct(_markdownObj);
			}
			
			_markdownObj.tHtml += "<li>\n";
			_markdownObj.tHtml += tResult[3];
			//tThis.DebugFct("tThis.ItemizedlistsFct", "_spaces_before", tResult[1], "_spaces_after", tResult[2], "_textFound", tResult[3], "_markdownObj.tCurrentLevel", _markdownObj.tCurrentLevel, "_markdownObj.tStatesWithLevels[_markdownObj.tCurrentLevel]", _markdownObj.tStatesWithLevels[_markdownObj.tCurrentLevel]);

			//tThis.DebugFct("tThis.ItemizedlistsFct", "_markdownObj.tCurrentNbWeightSpace", _markdownObj.tCurrentNbWeightSpace, "_markdownObj.tStatesWithLevels", JSON.stringify(_markdownObj.tStatesWithLevels));
			
//			tThis.AddCurrentBlockTextFct(_markdownObj);
			
			//_markdownObj.tCurrentFct = tThis.ItemizedlistsFct;
			//tClosedItems = false;
			return true;
		}
		
		return false;
	}
	
	
	// Itemized lists with numbers
	tThis.ItemizedlistsWithNumbersTestFct = function(_markdownObj, _lineInfos)
	{	
		let tResult = gRegExlistsWithNumbers.exec(_lineInfos.line);
		if( tResult != null )
		{
			return true;
		}
		return false;
	}
	
	// Itemized lists with numbers
	tThis.ItemizedlistsWithNumbersFct = function ItemizedlistsWithNumbers(_markdownObj, _lineInfos)
	{	
		let tResult = gRegExlistsWithNumbers.exec(_lineInfos.line);
		if( tResult != null )
		{
			// tResult[1] -> _spaces
			// tResult[2] -> _number
			// tResult[3] -> _space
			// tResult[4] -> _textFound
		
		/*	if(_lineInfos.level == 0)
				++_lineInfos.level;*/
			_markdownObj.tClosedItems = false;
			let tCloseList = false;
			
			/*_lineInfos.NbWeightSpace += 1;
			_lineInfos.NbWeightSpace += tResult[2].length;*/
			_lineInfos.NbWeightSpace += tResult[2].length;
			_lineInfos.NbWeightSpace -= 1;
			_lineInfos.NbWeightSpace += tResult[3].length;
			
			if( _lineInfos.NbWeightSpace>_markdownObj.tCurrentNbWeightSpace )
			{
				_markdownObj.tCurrentNbWeightSpace = _lineInfos.NbWeightSpace;
				//++_markdownObj.tCurrentLevel;
				
				//if( (_markdownObj.tCurrentLevel+1) > _markdownObj.mCurrentLevelMaxForItemizedlists)
				if( (_markdownObj.tCurrentNbWeightSpace+1) > _markdownObj.mCurrentLevelMaxForItemizedlists)
					_markdownObj.mCurrentLevelMaxForItemizedlists = _markdownObj.tCurrentNbWeightSpace+1;
			}
			else if( _lineInfos.NbWeightSpace<_markdownObj.tCurrentNbWeightSpace )
			{
				tCloseList = true;
				_markdownObj.tCurrentNbWeightSpace = _lineInfos.NbWeightSpace;
				//--_markdownObj.tCurrentLevel;
			}
	
			// 0x8000 - close <ul>
			if( _markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace]&0x8000 || tCloseList)
			{
				//tThis.DebugFct("CloseAllListsFct 4");
				tThis.CloseAllListsFct(_markdownObj, _lineInfos.tCurrentNbWeightSpace);
			}

			
			/*_markdownObj.tCurrentLevel = 0;
			if( tResult[1] )
				_markdownObj.tCurrentLevel = tResult[1].length;*/
				

//			tThis.CloseAllListsFct (_markdownObj, _markdownObj.tCurrentLevel);
			
			// New data to this level
			if( _markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace] == 0 )
			{
			//	_markdownObj.tClosedItemsLevel = -2;
				_markdownObj.tStatesWithLevels[_markdownObj.tCurrentNbWeightSpace] = 0x800/*|_markdownObj.tCurrentNbWeightSpace*/;
//				_markdownObj.tStartListOL = true;
				_markdownObj.tHtml += '<ol start='+tResult[2]+'>\n';
			}
			else
			{
				_markdownObj.tCurrentBlockText += '</li>\n';
				tThis.AddCurrentBlockTextFct(_markdownObj);
			}
			
			//tThis.DebugFct("tThis.ItemizedlistsWithNumbersFct", "_spaces", tResult[1], "_prefix", tResult[3], "_textFound", tResult[4], "_markdownObj.tCurrentLevel", _markdownObj.tCurrentLevel);
			
			//tThis.DebugFct("tThis.ItemizedlistsWithNumbersFct", "_markdownObj.tCurrentNbWeightSpace", _markdownObj.tCurrentNbWeightSpace, "_markdownObj.tStatesWithLevels", JSON.stringify(_markdownObj.tStatesWithLevels));

			_markdownObj.tHtml += "<li>\n";
			_markdownObj.tCurrentBlockText += tResult[4];
//			tThis.AddCurrentBlockTextFct(_markdownObj);
			//_markdownObj.tCurrentFct = tThis.ItemizedlistsWithNumbersFct;
			//tClosedItems = false;
			return true;
		}

		return false;
	}

	// Enable to close all list with a superior level
	tThis.CloseAllListsFct = function CloseAllLists(_markdownObj, _level)
	{
		if( !_markdownObj.tClosedItems )
		{
				
//			tThis.DebugFct("tThis.CloseAllListsFct", "_markdownObj.mCurrentLevelMaxForItemizedlists", _markdownObj.mCurrentLevelMaxForItemizedlists, "_markdownObj.tClosedItemsLevel", _markdownObj.tClosedItemsLevel, "_level", _level);
		
			let index = _markdownObj.mCurrentLevelMaxForItemizedlists;

//			tThis.DebugFct("tThis.CloseAllListsFct", "_markdownObj.tCurrentNbWeightSpace", _markdownObj.tCurrentNbWeightSpace, "_markdownObj.tStatesWithLevels", JSON.stringify(_markdownObj.tStatesWithLevels));

			while(index-->_level)
			{
				if( _markdownObj.tStatesWithLevels[index] != 0)
				{
					// close 0x800 (ol) or 0x8000 (ul) if needed
					if(_markdownObj.tStatesWithLevels[index]&0x800)
						tThis.AddCurrentBlockTextFct(_markdownObj,'</li>\n</ol>\n');
					else
						tThis.AddCurrentBlockTextFct(_markdownObj,'</li>\n</ul>\n');

					//_markdownObj.tCurrentNbWeightSpace = _markdownObj.tStatesWithLevels[index]&0x7FF;
					
//					tThis.DebugFct("tThis.CloseAllListsFct", " close index", index);

					_markdownObj.tStatesWithLevels[index] = 0;				
				}
			}
			
			if( _level == 0)
			{
				_markdownObj.tClosedItems = true;
				_markdownObj.tCurrentNbWeightSpace = 0;
			}
			//_markdownObj.tCurrentLevel = _level;
			//if( _markdownObj.tCurrentLevel <0)
			//	_markdownObj.tCurrentLevel = 0;
				
//			_markdownObj.tClosedItemsLevel = _level;
		}
	}


	// Itemized lists with numbers
	tThis.ImageOrLinkLaterRefFct = function ImageorLinklaterRef(_markdownObj, _lineInfos)
	{	
		// Image or link later reference
		let tResult = (/\[(.*?)\]:\s+(.*)/).exec(_lineInfos.line);
		if( tResult != null )
		{
			// tResult[1] -> _refName
			// tResult[2] -> _link
		
			if(tResult.length>2 )
			{
				const tURL = tResult[2];
				// Search for the first space to get url + params
				let tIndexLink = tURL.search(/\s/);
				if( tIndexLink != -1 )
				{
					// Search for first non white space
					tIndex = tIndexLink+1 + tURL.substring(tIndexLink+1).search(/\S/)
					const tChar = tURL[tIndex];
	
					// if not the end of the url
					if(tChar != ')')
					{
						//tThis.DebugFct("Image later reference", tRes[1], tRes);
						// if the beginning of a string
						if(tChar == '"' || tChar == "'" || tChar == "(")
						{
							const tIndexEnd = tIndex+1 + tURL.substring(tIndex+1).search(/["')]/);
							_markdownObj.mImageReferences[tResult[1].toLowerCase()] = {"link":tURL.substring(0, tIndexLink),"title":tURL.substring(tIndex+1, tIndexEnd)};
						}
						else
						{
							_markdownObj.mImageReferences[tResult[1].toLowerCase()] = {"link":tURL.substring(0, tIndexLink),"title":tURL.substring(tIndex, tURL.length)};
						}
						return true;
					}
				}
			}
			//tThis.DebugFct("Image later reference", tResult[2]);
			_markdownObj.mImageReferences[tResult[1].toLowerCase()] = {"link":tResult[2],"title":gNoString};

			tConvertURL = false;
			return true;
		}
		return false;
	}		

	// Hr line
	tThis.HrLine = function(_markdownObj, _lineInfos)
	{	
	// HR Line like '* * *' or '- - -'
		let tResult = (/^[\*-]\s[\*-]\s[\*-]/).exec(_lineInfos.line);
		if( tResult != null )
		{
//			tThis.CloseAllListsFct(_markdownObj, 0);
			_markdownObj.tHtml += '<hr>';
			return true;
		}
	// HR Line like '------' or '****' or '_____'
		tResult = (/^[\*_-]{3}/).exec(_lineInfos.line);
		if( tResult != null )
		{
//			tThis.CloseAllListsFct(_markdownObj, 0);
			_markdownObj.tHtml += '<hr>';
			return true;
		}
		return false;
//		_text = _text.replace(/^[\*_-]{3}[\*_-]*/g, function(_string, _prefix, _textFound){
//			return "<hr>";
//		});
	}

	tThis.tTestBufferLength = 256;
	tThis.tTestSpaces = new Array(tThis.tTestBufferLength);
	tThis.tTestChar = new Array(tThis.tTestBufferLength);
	tThis.tTestCharCode = new Array(tThis.tTestBufferLength);
	tThis.tTestCharList = new Array(tThis.tTestBufferLength);
	//tThis.tTestCharClose = new Array(tThis.tTestBufferLength);
	
	// Init to 0
	for(let iChar = tThis.tTestBufferLength;iChar--;)
	{
		tThis.tTestSpaces[iChar] = 0;
		tThis.tTestChar[iChar] = undefined;
		tThis.tTestCharCode[iChar] = undefined;
		tThis.tTestCharList[iChar] = undefined;
		
		//tThis.tTestCharClose[iChar] = undefined;
		
	}

	function charCode(_s)
	{
		return _s.charCodeAt(0);
	}
	
	tThis.spaceCharCode = charCode(' ');
	tThis.startCharCode = charCode('*');
	tThis.minusCharCode = charCode('-');
	tThis.plusCharCode = charCode('+');
	tThis.zeroCharCode = charCode('0');
	tThis.nineCharCode = charCode('9');

	tThis.tTestSpaces[charCode("\t")] = 4;
	tThis.tTestSpaces[charCode(" ")] = 1;
	
	tThis.tTestChar[13] = tThis.EmptyLine;
	
	tThis.tTestChar[charCode('=')] = tThis.TitlesUnderlinesFct;
	tThis.tTestChar[tThis.minusCharCode] = [tThis.HrLine, tThis.TitlesUnderlinesFct, tThis.ItemizedlistsFct];
	tThis.tTestChar[charCode('_')] = tThis.HrLine;
	
	
	
	tThis.tTestCharCode[charCode('~')] = tThis.MatchCodeFct;
	tThis.tTestCharCode[charCode('`')] = tThis.MatchCodeFct;
	tThis.tTestChar[charCode('~')] = tThis.MatchCodeFct;
	tThis.tTestChar[charCode('`')] = tThis.MatchCodeFct;
	tThis.tTestChar[tThis.spaceCharCode] = tThis.MatchCodeWithSpaceFct;

	tThis.tTestChar[charCode('#')] = tThis.TitleFct;
	
	tThis.BlockquoteCodeChar = charCode('>');
	tThis.tTestChar[tThis.BlockquoteCodeChar] = tThis.BlockquoteFct;
	//tThis.tTestCharClose['>')] = tThis.BlockquoteCloseFct;
	
	
	tThis.tTestChar[charCode('|')] = tThis.TableFct;

	tThis.tTestChar[tThis.startCharCode] = [tThis.HrLine, tThis.ItemizedlistsFct];
	tThis.tTestChar[tThis.plusCharCode] = tThis.ItemizedlistsFct;
	
	tThis.tTestCharList[tThis.startCharCode] = tThis.ItemizedlistsTestFct;
	tThis.tTestCharList[tThis.plusCharCode] = tThis.ItemizedlistsTestFct;
	tThis.tTestCharList[tThis.minusCharCode] = tThis.ItemizedlistsTestFct;
	
	let iMax=tThis.nineCharCode;
	for(let i=tThis.zeroCharCode;i<=iMax;i++)
	{
		tThis.tTestCharList[i] = tThis.ItemizedlistsWithNumbersTestFct;
		tThis.tTestChar[i] = tThis.ItemizedlistsWithNumbersFct;
	}
		
	tThis.tTestChar[charCode('[')] = tThis.ImageOrLinkLaterRefFct;


};

// Create Markdown
TR.MarkdownFS = function( options )
{
	let tThis = this;
	
	// BEGIN ---- OPTIONS ----
	tThis.mOptions = {};
	
	// Timing
	tThis.mOptions.Timing = false;
	
	// iFrame Allowed
	tThis.mOptions.iFrameAllowed = true;
	
	// Filter Code
	tThis.mOptions.FilterCodes = function ( _code, _codeType){ return '<pre>'+TR.MarkdownFSGlobal.EscapeHtmlFct(_code)+'</pre>';  };

	// Filter Chapter
	tThis.mOptions.FilterHeadingSections = function ( _Headerlevel, _chapterName, _options ){ return '<H'+_Headerlevel+this.convertToId(_chapterName)+'>' + _chapterName + '</H'+_Headerlevel+'>\n'; };

	// Number of level for itemizedlists
	tThis.tLevelMaxForItemizedlists = 100;
	tThis.mCurrentLevelMaxForItemizedlists = 2;
	tThis.tStatesWithLevels = new Array(tThis.tLevelMaxForItemizedlists);

	
	// Merge options
	if( options )
	{
		let tThis = this;
		for(let key in options) {
			tThis.mOptions[key] = options[key];
		}
	}
}
/*
// Create debug function
TR.MarkdownFS.prototype.ReturnFirstNonSpaceChar = function(_lineInfos)
{
	let tLineLength = _lineInfos.line.length;
	_lineInfos.NbWeightSpace = 0;
	_lineInfos.NbSpace = 0;
	if( tLineLength != 0 )
	{
		let tCurrentChar = 0;
		let tWeightSpace = 0;
		for(let iChar=0;iChar<tLineLength;iChar++)
		{
			tCurrentChar = _lineInfos.line[iChar].charCodeAt(0);

			tWeightSpace = TR.MarkdownFSGlobal.tTestSpaces[tCurrentChar];
			if( tWeightSpace != undefined)
			{
				_lineInfos.NbWeightSpace += tWeightSpace;
				if(tWeightSpace>0)
					++_lineInfos.NbSpace;
			}

			if( tWeightSpace == 0 )
			{
				_lineInfos.firstChar = tCurrentChar;
				return;
			}
		}
	}
	_lineInfos.firstChar = 13;
}
*/

///
/// Convert To Id
///
TR.MarkdownFS.prototype.convertToId = function( _id )
{
	let tGlobal = TR.MarkdownFSGlobal;
	// Image
	_id = _id.replace(tGlobal.gRegExpReplaceImg, function(_string, _text_img, _url_img){
		return tGlobal.gNoString;
	});
				
	// Url
	_id = _id.replace(tGlobal.gRegExpReplaceUrl, function(){
		return tGlobal.gNoString;
	});
					
	if(_id==tGlobal.gNoString)
		return _id;
				
	// Markdown Url
	_id = _id.replace(tGlobal.gRegExpReplaceMarkDownUrl, function(_string, _id){
		return _id;
	});
	
	// Name with <
	_id = _id.replace(/\\</g, function(){
		return "<";
	});

	_id = _id.replace(/\s/g, '-');
	
	return ' id="'+_id.toLowerCase()+'"';
}

///
/// parse to Html
///
TR.MarkdownFS.prototype.toHtml = function( _data )
{
	let tThis = this;

	tThis.tStartCode = false;
	tThis.tStartCodeWithSpace = false;
	tThis.tShowCurrentChapter = true;
//	tThis.tWasStartCode = false;
	
	tThis.tHtml = "";
	tThis.tCurrentFct = null;
	
	tThis.tStartParagraph = false;
	tThis.tCurrentBlockText = "";
	//tThis.tStatesWithLevels = {};
	
	tThis.mListInlineCodes = [];
	tThis.mListCodes = [];
	tThis.mListUrl = [];
	tThis.mListImg = [];
	tThis.mListVid = [];
	tThis.mListIFrame = [];
	
	//tThis.tClosedItemsLevel = -1;
	tThis.tClosedItems = true;
	
	// Init to 0
	for(let iLevelMax = tThis.tLevelMaxForItemizedlists;iLevelMax--;)
	{
		tThis.tStatesWithLevels[iLevelMax] = 0;
	}
	
//	tThis.tStartListUL = false;
//	tThis.tStartListOL = false;
	tThis.tWasInBlockquote = false;
	
	// Start table
	// - if 0 the table if not yet started
	// - if 1 the table is started
	// - if 2 the table is started and the alignement row (second one is done)
	tThis.tStartTable = 0;
	
	//tThis.tCurrentLevel = 0;
	tThis.tCurrentNbWeightSpace = 0;
	tThis.tCurrentBlockLevel = 0;
	tThis.tStartChapter = false;
	tThis.tTableAligns = {};
	tThis.tLastBlockCodeType = "";
	
	tThis.mImageReferences = {};
	
	
	
	let tStart;
	if( tThis.mOptions.Timing )
	{
		tStart = performance.now();
	}

	let tLines = _data.split('\n');
	let tGlobal = TR.MarkdownFSGlobal;
	
	

	let tNbFunctions = 0;
	let tNbLines = tLines.length;
	let tContinue = false;
	let tLineInfos = {};
	let tLevelSave = 0;
	let tNbSpacesSave = 0;
	let tFunctions;
	let tFunctionsListTest;
	
	let tIsList = false;
	
	
	for(let iLine=0;iLine<tNbLines;iLine++ )
	{
		tLineInfos.line = tLines[iLine];
		tGlobal.ReturnFirstNonSpaceChar(tLineInfos);
		
		//tGlobal.DebugFct("-- Line", tLineInfos.line, "tThis.firstChar", tLineInfos.firstChar, '('+String.fromCharCode(tLineInfos.firstChar)+')', "tLineInfos.NbWeightSpace", tLineInfos.NbWeightSpace, "tLineInfos.level", tLineInfos.level, "tThis.tCurrentBlockText", tThis.tCurrentBlockText);
		
		if( tThis.tShowCurrentChapter )
		{
			if( tThis.tStartCodeWithSpace )
			{
				if( tGlobal.MatchCodeWithSpaceFct(tThis, tLineInfos) )
					continue;
			}
			if( !tThis.tStartCode)
			{
				if( tLineInfos.firstChar != 13 )
				{	
					if( tLineInfos.firstChar == tGlobal.BlockquoteCodeChar )
					{
						tThis.tCurrentFct = tGlobal.BlockquoteFct;
					}
					
					if( tGlobal.MatchCodeWithSpaceFct(tThis, tLineInfos) )
						continue;
						
					// Check if a list start
					if(tLineInfos.firstChar == tGlobal.startCharCode || tLineInfos.firstChar == tGlobal.minusCharCode || tLineInfos.firstChar == tGlobal.plusCharCode || (tLineInfos.firstChar >= tGlobal.zeroCharCode && tLineInfos.firstChar <= tGlobal.nineCharCode))
					{
						if(tLineInfos.line.charCodeAt(tLineInfos.firstCharIndex+1) == tGlobal.spaceCharCode )
						{
							tLineInfos.NbWeightSpace+=2;
						}
					}
	/*
					if( tLineInfos.NbWeightSpace < tThis.tCurrentNbWeightSpace)
					{
						if( tLineInfos.level > 0)
							--tLineInfos.level;
					}*/
					
			/*		tFunctionsListTest = tGlobal.tTestCharList[tLineInfos.firstChar];
					if( tFunctionsListTest != undefined )
					{
						tIsList = tFunctionsListTest(tThis, tLineInfos);
					}
					else
					{
						tIsList = false;
					}
					
					if( !tIsList )*/
					{
						//tGlobal.DebugFct("CloseAllListsFct 2", "tLineInfos.level", tLineInfos.level, "tThis.tCurrentLevel", tThis.tCurrentLevel);	
					    // End all list
						if( !tThis.tClosedItems && ((tLineInfos.NbWeightSpace < tThis.tCurrentNbWeightSpace) && (tLineInfos.NbWeightSpace != (tThis.tCurrentNbWeightSpace-2)) || (tLineInfos.NbWeightSpace == 0)))
						{		
//							tGlobal.DebugFct("CloseAllListsFct 3");
							tGlobal.CloseAllListsFct(tThis, tLineInfos.NbWeightSpace);
							//tThis.tCurrentNbWeightSpace = tLineInfos.NbWeightSpace;
						}
					//	else
					//		tThis.tCurrentLevel = tLineInfos.level;
					}
				}
				else
				 {
				 		//tGlobal.DebugFct("Blockquote7");
						if( tThis.tWasInBlockquote)
						{
							//tGlobal.DebugFct("tFunctions != undefined + BlockquoteCloseFct", "tLineInfos.firstChar", tLineInfos.firstChar, "tGlobal.BlockquoteCodeChar", tGlobal.BlockquoteCodeChar);
							tGlobal.BlockquoteCloseFct(tThis, tLineInfos);
						}
				 }			 						
			}
			
			// Try to execute the last function assuming, we are still doing a table for example 
			// Or force execution for blockquote to use the 2 steps tot execute the decoding (blockquote and normal decoding) 
			if( tThis.tCurrentFct != null )
			{
				tThis.parseAgain = false;
				
				if( (tThis.tCurrentFct(tThis, tLineInfos)) )
				{
					tLevelSave = tLineInfos.level;
					tNbSpacesSave = tLineInfos.NbSpace;
					continue;
				}
				else
				{
					if( tThis.parseAgain )
					{
						if( tGlobal.MatchCodeWithSpaceFct(tThis, tLineInfos))
						{
							continue;
						}
					}
				}
			}
				
		}
		
		if(tThis.tStartCode)
		{
			// Case where lib reading the code, do not execute other markdown inside.
			tFunctions = tGlobal.tTestCharCode[tLineInfos.firstChar];
		}
		else
		{
			tFunctions = tGlobal.tTestChar[tLineInfos.firstChar];
		}
		
		// Case where we do not show the chapter 
		if( !tThis.tShowCurrentChapter )
		{
			if( tFunctions != tGlobal.TitleFct)
			{
				continue;
			}
		}
		
		if( tFunctions != undefined )
		{
			if( Array.isArray(tFunctions) )
			{
				tContinue = false;
		
				tNbFunctions = tFunctions.length;
				for(let iFunction=0;iFunction<tNbFunctions;iFunction++ )
				{
					if( tFunctions[iFunction](tThis, tLineInfos) )
					{
						tContinue = true;
						tLevelSave = tLineInfos.level;
						tNbSpacesSave = tLineInfos.NbSpace;
						break;
					}
				}
				
				if( tContinue )
					continue;
			}
			else
			{
				if( tFunctions(tThis, tLineInfos) )
				{
					tLevelSave = tLineInfos.level;
					tNbSpacesSave = tLineInfos.NbSpace;
					//tContinue = true;
					continue;
				}
			}
		}
			
		//}while(tThis.parseAgain);
		
	/*	if( tLineInfos.firstChar == 13 )
		{
			tThis.tCurrentFct = null;
				
			EmptyLine();

			tLevelSave = 0;
			tNbSpacesSave = 0;
			
			// End table if need (need to be done if this line execute before table, need to end the table)
	//		tGlobal.EndTableIfNeedFct(_markdownObj);
		}
		else
		{
		*/

			tThis.tCurrentFct = null;
			
			//tGlobal.DebugFct("continue", "tLineInfos.line", tLineInfos.line, "tLineInfos.firstChar", tLineInfos.firstChar, 'tThis.tStartCode', tThis.tStartCode, "tLineInfos.level", tLineInfos.level, "tLevelSave", tLevelSave);


			// If code started, add end line
			if( tThis.tStartCode )
			{
				tLineInfos.line = tLineInfos.line.replace(/\t/g, tGlobal.TabToSpace);
			
				//tGlobal.DebugFct("tThis.tStartCode", "tNbSpacesSave", tNbSpacesSave, "tLineInfos.NbSpace", tLineInfos.NbSpace);
				if( tNbSpacesSave <= tLineInfos.NbSpace)
					tThis.tCurrentBlockText += tLineInfos.line.slice(tNbSpacesSave, tLineInfos.line.length) + '\n';
				else
					tThis.tCurrentBlockText += tLineInfos.line + '\n';
			}
			else
			{
				
				if( tLineInfos.firstChar == 13)
				{
					if( tThis.tCurrentBlockText != "")
					{
						if( !tThis.tClosedItems && (tLineInfos.NbWeightSpace < tThis.tCurrentNbWeightSpace || (tLineInfos.NbWeightSpace == 0)))
						{
							tGlobal.AddCurrentBlockTextFct(tThis);
						}
						else{
//							tGlobal.DebugFct("Add tCurrentBlockText", "tLineInfos.firstChar == 13");
//							tGlobal.DebugFct('> HTML','<p>');

							tThis.tHtml += '<p>';
							tGlobal.AddCurrentBlockTextFct(tThis,'</p>\n');
						}
					}
				}
				else
				{
					//tGlobal.DebugFct("CloseAllListsFct", "tLineInfos.level", tLineInfos.level, "tLevelSave", tLevelSave, "tLineInfos.line", tLineInfos.line);
			
					if( tLevelSave != tLineInfos.level )
					{
						//tGlobal.DebugFct("CloseAllListsFct", "tLineInfos.level", tLineInfos.level, "tThis.tCurrentLevel+tThis.tCurrentLevel", tThis.tCurrentLevel*tThis.tCurrentLevel*4, "tLineInfos.line", tLineInfos.line, "tLineInfos.lineLength", tLineInfos.lineLength);
			
	/*			    	// End all list
						if( tLineInfos.level < (tThis.tCurrentLevel))
						{
							tGlobal.CloseAllListsFct(tThis, 0);
						}*/
						
						if( tThis.tCurrentBlockText != "")
						{
						//	tLevelSave = tLineInfos.NbWeightSpace;
//							tGlobal.DebugFct("Add tCurrentBlockText", "tLevelSave", tLevelSave);
//							tGlobal.DebugFct('> HTML','<p>');
							
							tThis.tHtml += '<p>';
							tGlobal.AddCurrentBlockTextFct(tThis,'</p>\n');
						}
						tThis.tCurrentBlockText += tLineInfos.line+ ' ';
						
						tLevelSave = tLineInfos.level;
						tNbSpacesSave = tLineInfos.NbSpace;
					}
					else
					{
						//let tResult = (/^\s*(.*)/).exec(tLineInfos.line);
						//tThis.tCurrentBlockText += tResult[1] + ' 9';
						if(tLineInfos.needBR == 0)
							tThis.tCurrentBlockText += tLineInfos.line + ' ';
						else
						{
							if(tLineInfos.needBR > 0)
								tThis.tCurrentBlockText += tLineInfos.line.substring(0, tLineInfos.line.length-tLineInfos.needBR) + "<br>";
							else
								tThis.tCurrentBlockText += tLineInfos.line.substring(0, tLineInfos.line.length-+tLineInfos.needBR) + ' ';
						}
					}
				}
				
			}
			
			
			/*
			while(tNbWeightSpaces--)
			{
				tThis.tCurrentBlockText += '<span style="padding-left:1em;" class="mardown-space"></span>';
			}
			while(tNbTabs--)
			{
				tThis.tCurrentBlockText += '<span style="padding-left:5em;" class="mardown-tab"></span>';
			}*/
			
			// Add space in front to enable to catch underline or bold text

	}

	tLineInfos.lineLength = 0;
	tLineInfos.NbWeightSpace = 0;
	tLineInfos.NbSpace = 0;
	tLineInfos.level = 0;
	tLineInfos.line = '';
	
	tGlobal.BlockquoteCloseFct(tThis, tLineInfos);
		
	tGlobal.AddCurrentBlockTextFct(tThis,'');

	// End chapter if need 
	tGlobal.CloseAllListsFct(tThis, 0);
	//tThis.EndChapterFct();

	if( tThis.mOptions.Timing )
	{
	    let tEnd = performance.now();  // log end timestamp
		let tDiff = tEnd - tStart;
		
	    console.log("[Markdown] ", "Parse Markdown: ", tDiff, "ms");
	}
	
	return tGlobal.UpdateWithUnderLineOrStrongOrEmFct(tThis, tThis.tHtml);
}