
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

function getTypeString(typeCtx){
	var ret = typeCtx.type;
	if(typeCtx.childTypes == null){		
		return ret;
	}
	ret += " ";
	for(var i=0;i<typeCtx.childTypes.length;i++){
		ret += "(";
		ret += getTypeString(typeCtx.childTypes[i]);
		ret += ")";
		if(i<typeCtx.childTypes.length - 1){
			ret += " ";
		}
	}
	return ret;
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
				var op = toSimpleData({
					vname: 'op',
					type: getTypeString(typeTree.childTypes[0]),
					value: value.arguments[0]
				});

				ret[vname] = op.op;
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
						type: getTypeString(typeTree.childTypes[0]),
						value: c.key
					});
					
					var val = toSimpleData({
						vname: 'val',
						type: getTypeString(typeTree.childTypes[1]),
						value: c.val
					});
					
					ret[vname][key.key] = val.val;					
				}
				
			} else{
				throw new TypeError("Map item must is an array");
			}
			break;
		}
		case 'List':
			ret[vname] = [];
			var childs = value;
			if(Array.isArray(childs)){
				for (var c of childs) {					
					var c = toSimpleData({
						vname: 'c',
						type: getTypeString(typeTree.childTypes[0]),
						value: c
					});
					ret[vname].push(c.c);
				}
				
			} else{
				throw new TypeError("List item must is an array");
			}			
			break;
		case 'Pair':
			{
				ret[vname] = {};			
				var childs = value.arguments;				
				if(Array.isArray(childs) && childs.length == 2){
					var x = toSimpleData({
						vname: 'x',
						type: getTypeString(typeTree.childTypes[0]),
						value: childs[0]
					});

					var y = toSimpleData({
						vname: 'y',
						type: getTypeString(typeTree.childTypes[1]),
						value: childs[1]
					});
					
					ret[vname].x = x.x;
					ret[vname].y = y.y;
					
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

function toStraightData(node){
	var vname = node.vname;
	var type = node.type;
	var value = node.value;
	var ret = {
		vname : node.vname,
		type : node.type,
	};	
	var typeTree = parseTypeTree(type);		
	switch (typeTree.type)
	{
		case 'Bool':
			ret.value = value['constructor'].toLowerCase() == 'true';
			break;
		case 'String':
		case 'ByStr20':
			ret.value = value;
			break;
		case 'Option':
			if(value['constructor'] == 'Some'){
				var op = toStraightData({
					vname: 'op',
					type: getTypeString(typeTree.childTypes[0]),
					value: value.arguments[0]
				});

				ret.value = op.value;
			} else{
				ret.value = '';
			}
			break;
		case 'Map':
		{
			ret.value = {};
			
			var childs = value;
			if(Array.isArray(childs)){
				for (var c of childs) {
					var key = toStraightData({
						vname: 'key',
						type: getTypeString(typeTree.childTypes[0]),
						value: c.key
					});
					
					var val = toStraightData({
						vname: 'val',
						type: getTypeString(typeTree.childTypes[1]),
						value: c.val
					});
					
					ret.value[key.value] = val.value;					
				}
				
			} else{
				throw new TypeError("Map item must is an array");
			}
			break;
		}
		case 'List':
			ret.value = [];
			var childs = value;
			if(Array.isArray(childs)){
				for (var c of childs) {					
					var c = toStraightData({
						vname: 'c',
						type: getTypeString(typeTree.childTypes[0]),
						value: c
					});
					ret.value.push(c.value);
				}
				
			} else{
				throw new TypeError("List item must is an array");
			}			
			break;
		case 'Pair':
			{
				ret.value = {};			
				var childs = value.arguments;				
				if(Array.isArray(childs) && childs.length == 2){
					var x = toStraightData({
						vname: 'x',
						type: getTypeString(typeTree.childTypes[0]),
						value: childs[0]
					});

					var y = toStraightData({
						vname: 'y',
						type: getTypeString(typeTree.childTypes[1]),
						value: childs[1]
					});
					
					ret.value.x = x.value;
					ret.value.y = y.value;
					
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
			ret.value = parseInt(value);
			break;
		default:
			ret.value = value;
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

function convertToSimpleJson(input, bStraight = false){	
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
			stackOuts[k] = bStraight ? toStraightData(curIn) : toSimpleData(curIn);
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