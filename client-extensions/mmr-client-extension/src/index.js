import React from 'react';
import ReactDOM from 'react-dom';
import MMRApiClient from './components/MmrApiClient';
import './common/styles/index.scss';
import './common/styles/App.scss';

class WebComponent extends HTMLElement {
	connectedCallback() {
		const apikey=this.getAttribute("apiKey");
		const MakerCategoryName=this.getAttribute("MakerCategoryName");
		const globalSiteId=this.getAttribute("globalSiteId");
		const catalogPage=this.getAttribute("catalogPage");
		ReactDOM.render(
			<MMRApiClient apikey={apikey} MakerCategoryName={MakerCategoryName} globalSiteId={globalSiteId} catalogPage={catalogPage}/>,
			this
		);
	}
}
const ELEMENT_ID = 'mmr-client-extension';
if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, WebComponent);
}