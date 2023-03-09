
export function getValid(data){
    if(data == "Nan" || data == "" || data == 'undefined' || data == '0' || data == 0 ){
        return 0
    }else{
        return data
    }
}

export function getValidInteger(data){
    if(data == "Nan" || isNan(data) || data == "" || data == 'undefined' || data == '0' || data == 0 || parseInt(data) < 0){
        return 0
    }else{
        return data
    }
}