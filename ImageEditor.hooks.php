<?php
/**
 * Hooks for BoilerPlate extension
 *
 * @file
 * @ingroup Extensions
 */

class ImageEditorHooks
{
    /**
     * Add JSON format of Image Editor export to metadata
     * @param LocalFile $file
     * @return bool
     */
    public static function onFileUpload($file)
    {
        $meta = $file;
        $dbw = $file->repo->getMasterDB();
        $meta = unserialize($file->getMetadata());
        $meta["imageEditorContent"] = $file->getDescription();

        $dbw->update('image',
            ['img_metadata' => serialize($meta)],
            ['img_name' => $file->getName()],
            __METHOD__);
        return true;
    }
    public static function onImagePageShowTOC( $page, &$toc){
        global $wgScript;

        array_unshift($toc, '<li><a href="'. $wgScript .'?title=Special:ImageEditor&file='.$_GET["title"].'">✎ ' . $page->getContext()->msg( 'open-in-image-editor' )->escaped() . '</a></li>');
        return true;
    }
}
