import React from 'react';
import { useSelector } from 'react-redux';
import MyHomeContent from './MyHomeContent';
import LeftNavSidebar from '../Navigation/LeftNavSidebar'

const Workspace = () => {
    const packageBuilderActive = useSelector((state) => state.header.packageBuilderActive);

    return (
        <>
        {packageBuilderActive ? <LeftNavSidebar /> : <MyHomeContent/>}
        </>
    )
}

export default Workspace