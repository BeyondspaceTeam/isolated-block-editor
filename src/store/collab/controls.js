import { ActionCreators } from 'redux-undo';

import { createRegistryControl } from '@wordpress/data';

const debugUndo = require( 'debug' )( 'iso-editor:collab:undo' );

/** @returns {import('../../components/collaborative-editing').RichTextHint|undefined} */
const getRichTextHint = ( registry ) => {
	if ( registry.select( 'isolated/editor' ).selectionIsInRichText() ) {
		const { clientId, attributeKey } = registry.select( 'core/block-editor' ).getSelectionStart();
		return { clientId, attributeKey };
	}
	return undefined;
};

const applyChangesToYDoc = createRegistryControl( ( registry ) => ( action ) => {
	const doc = registry.select( 'isolated/editor' ).getYDoc();

	if ( doc && ! action.isTriggeredByYDoc ) {
		doc.applyLocalChangesToYDoc(
			{ blocks: action.blocks },
			{
				isInitialContent: action.isInitialContent,
				richTextHint: getRichTextHint( registry ),
			}
		);
	}

	return action;
} );

export default {
	UPDATE_BLOCKS_WITH_UNDO: applyChangesToYDoc,
	UPDATE_BLOCKS_WITHOUT_UNDO: applyChangesToYDoc,

	[ ActionCreators.undo().type ]: createRegistryControl( ( registry ) => ( action ) => {
		const undoManager = registry.select( 'isolated/editor' ).getUndoManager();

		if ( ! undoManager ) {
			return action;
		}

		debugUndo( 'undo' );
		undoManager.undo();
		return; // prevent default action
	} ),

	[ ActionCreators.redo().type ]: createRegistryControl( ( registry ) => ( action ) => {
		const undoManager = registry.select( 'isolated/editor' ).getUndoManager();

		if ( ! undoManager ) {
			return action;
		}

		debugUndo( 'redo' );
		registry.select( 'isolated/editor' ).getUndoManager().redo();
		return; // prevent default action
	} ),
};
