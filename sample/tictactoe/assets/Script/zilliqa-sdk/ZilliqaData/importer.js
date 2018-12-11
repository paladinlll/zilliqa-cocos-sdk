
function isObject(a) {
    return (!!a) && (a.constructor === Object);
};
function isZilliqaData(node){
	if(!isObject(node)) return false;
	if ('vname' in node &&
		'type' in node &&
		'value' in node){
		return true;
	}
	return false;		
}

function parseTypeTree(strType){	
	var typeStack = [];
	var typeCtx = {};
	typeStack.push(typeCtx);	
	var subType = '';	
	var i = 0;
	while(i < strType.length){
		switch (strType[i])
		{
			case '(':				
				typeStack.push({});
				if (typeCtx != null)
				{					
					if(typeCtx.childTypes == null){
						typeCtx.childTypes = [];
						typeCtx.type = subType;
					}
					typeCtx.childTypes.push((typeStack[typeStack.length - 1]));					
				}
				subType = "";				
				typeCtx = typeStack[typeStack.length - 1];
			break;
			case ')':									
				if (typeStack.length == 0)
					throw new TypeError("JSON Parse: Too many closing brackets");

				typeStack.pop();
				if (subType.length > 0) {
					typeCtx.type = subType;
				}
								
				subType = "";
				if (typeStack.length > 0){
					typeCtx = typeStack[typeStack.length - 1];					
				}
				break;
			case ' ':
			case '	':
			case '\n':
				break;
			default:
				subType += strType[i];
				break;
		};
		++i;
	}
	
	if(!('type' in typeStack[0])){
		typeStack[0].type = strType;
	}
	return typeStack[0];
}
function toSimpleData(node){
	var vname = node.vname;
	var type = node.type;
	var value = node.value;
	var ret = {};
	
	var typeTree = parseTypeTree(type);		
	switch (typeTree.type)
	{
		case 'Bool':
			ret[vname] = value['constructor'].toLowerCase() == 'true';
			break;
		case 'String':
		case 'ByStr20':
			ret[vname] = value;
			break;
		case 'Option':
			if(value['constructor'] == 'Some'){
				ret[vname] = value.arguments[0];
			} else{
				ret[vname] = '';
			}
			break;
		case 'Map':
		{
			ret[vname] = {};
			
			var childs = value;
			if(Array.isArray(childs)){
				for (var c of childs) {
					var key = toSimpleData({
						vname: 'key',
						type: typeTree.childTypes[0].type,
						value: c.key
					});

					var val = toSimpleData({
						vname: 'val',
						type: typeTree.childTypes[1].type,
						value: c.val
					});
					
					ret[vname][key.key] = val.val;					
				}
				
			} else{
				throw new TypeError("Map item must is an array");
			}
			break;
		}
		case 'Uint32':
		case 'Uint64':
		case 'Uint128':
		case 'Int32':
		case 'Int64':
		case 'Int128':
			ret[vname] = parseInt(value);
			break;
		default:
			ret[vname] = value;
			break;
	};	
	return ret;
}

function getEmptyData(node){
	if(isObject(node)){
		return {};
	} else if(Array.isArray(node)){
		return [];
	}
	return '';
}

function convertToSimpleJson(input){	
	var stackIns = [];
	var stackParents = [];
	var stackOuts = [];

	stackIns.push(input);
	stackParents.push(-1);
	stackOuts.push(getEmptyData(input));

	var k = 0;
	while(k < stackIns.length){
		var curIn = stackIns[k];	
		
		if(isZilliqaData(curIn)){
			stackOuts[k] = toSimpleData(curIn);		
		} else if(isObject(curIn)){
		} else if(Array.isArray(curIn)){
			for (var p of input) {
				stackIns.push(p);
				
				var emptyData = getEmptyData(p) 
				stackOuts.push(emptyData);			
				stackParents.push(k);
			}
		} else{
			stackOuts[k] = JSON.parse(JSON.stringify(curIn));
		}
		
		k++;
	}

	k = stackIns.length - 1;
	while(k >= 0){
		var curIn = stackIns[k];	
		
		if(isZilliqaData(curIn)){
				
		} else if(isObject(curIn)){
		} else if(Array.isArray(curIn)){
			var mappable = {};
			
			for (var i=0;i<stackIns.length;i++) {
				if(stackParents[i] == k){
					stackOuts[k].push(stackOuts[i]);
					
					if(mappable != null){ 
						var size = 0, vname;
						for (vname in stackOuts[i]) {
							mappable[vname] = stackOuts[i][vname];
							size++;
						}
						if(size != 1){
							mappable = null;
						}
					}
				}
			}
			if(mappable != null){
				stackOuts[k] = mappable;
			}
		} else{
			
		}
		
		k--;
	}

	return stackOuts[0];
}

module.exports = {
	convertToSimpleJson
};