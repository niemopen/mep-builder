const headerMenuName = "headerMenu";
const packageMenuName = 'packageMenu';
const sidebarName = 'sidebar';

export function GetPackageMenuHeight(){
    if (window.document.getElementById(headerMenuName) == null || window.document.getElementById(packageMenuName) == null){
        return 0;
    }
    return window.document.getElementById(headerMenuName).clientHeight + window.document.getElementById(packageMenuName).clientHeight;
}

export function GetSidebarWidth(){
    if(window.document.getElementById(sidebarName) == null){ //element is not rendered
        return 0;
    }
    if(window.document.getElementById("sidebar").className.indexOf("visible") < 0){ //element is not visible
        return 0;
    }
    return window.document.getElementById(sidebarName).clientWidth;
}