
/*
 * 
 *   Copyright 2016 RIFT.IO Inc
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
/**
 * Provide the visual treatment for selecting elements in the Canvas.
 *
 * Clicking on a Descriptor toggles selection.
 * Clicking on a Path toggles selection.
 * Clicking on the SVG container removes selection.
 * Only one thing can be selected at a time.
 *
 */
import d3 from 'd3'
import DescriptorModelFactory from './../model/DescriptorModelFactory'
import ComposerAppActions from '../../actions/ComposerAppActions'
import SelectionManager from '../SelectionManager'
import CatalogItemsActions from '../../actions/CatalogItemsActions'

export default class DescriptorGraphSelection {

	constructor(graph) {
		this.graph = graph;
		this.containers = [];
	}

	addContainers(containers) {
		this.containers = containers;
	}

	render() {

		const comp = this;

		// prevent multiple bindings of the same listener
		this.unbindListeners();

		// clicking on the background deselects all descriptors
		comp.boundClickSVGHandler = function () {
			// do not deselect if user is dragging: https://github.com/mbostock/d3/issues/1445
			if (d3.event.defaultPrevented) return;
			const target = SelectionManager.getClosestElementWithUID(d3.event.target);
			if (target) {
				const data = d3.select(target).datum() || {};
				if (target && DescriptorModelFactory.isContainer(data)) {
					ComposerAppActions.selectModel(data);
					ComposerAppActions.outlineModel(data);
				} else {
					ComposerAppActions.clearSelection();
				}
			} else {
				ComposerAppActions.clearSelection();
			}
		};
		comp.graph.svg.on('click.selection', comp.boundClickSVGHandler);

	}

	unbindListeners() {
		this.graph.svg.on('.selection', null);
	}

	destroy() {
		this.unbindListeners();
		this.containers.length = 0;
		this.graph = null;
	}

}
