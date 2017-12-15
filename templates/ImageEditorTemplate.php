<?php
/**
 * @file
 */
if ( !defined( 'MEDIAWIKI' ) ) {
    die( -1 );
}

/**
 * HTML template for Special:MySpecialPage
 * @ingroup Templates
 */
class ImageEditorTemplate extends QuickTemplate {
    /**
     * Main processing is done here.
     *
     * For proper i18n, use $this->getMsg( 'message-key' ) with the appropriate
     * parameters (see [[Manual:Messages API]] on MediaWiki.org for further
     * details).
     * Because this is just an example, we're using hard-coded English text
     * here. In your production-grade code, you obviously should be using the
     * proper internationalization functions instead.
     */
    public function execute() {
        $context = $this->data['context']; // get
        global $wgScriptPath;
        ?>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/angular.js'></script>


        <div class="ie"  ng-app="colabedit" ng-controller="CanvasControls">

            <div class="ie__playground">
                <div class="ie__playground__container">
                    <canvas id="ie__canvas" width="800" height="600"></canvas>
                </div>
            </div>

            <div class="ie__info">
                <div class="ie__panel__horizontal">
                    <input class="input" type="text" placeholder="Image Name...">
                    <a title="" class="btn"><i class="far fa-save"></i></a>
                    <a title="" class="btn" ng-click="rasterize($event,'export.png')"><i class="fa fa-arrow-alt-circle-down"></i><small>png</small></a>
                    <a title="" class="btn" ng-click="rasterizeSVG($event,'export.svg')"><i class="far fa-arrow-alt-circle-down"></i><small>svg</small></a>
                    <a title="" class="btn" ><i class="far fa-save"></i></a>
<!--                    <a class="btn"><i class="fa fa-undo"></i></a>-->
<!--                    <a class="btn"><i class="fa fa-redo"></i></a>-->
                    <div class="ie__collaborators">
                        <a title="Pan Jan" style="color: #00a5ff;" class="btn"><i class="fa fa-user-circle"></i></a>
                        <a title="Jojo Celko" style="color: #00A000;" class="btn"><i class="fa fa-user-circle"></i></a>
                        <a title="Martin Danek" class="btn" style="color: #7a43b6;"><i class="fa fa-user-circle"></i></a>
                        <a title="Pan Jan" style="color: #ff7e72;" class="btn"><i class="fa fa-user-circle"></i></a>
                        <a title="Jojo Celko" style="color: #efed3f;" class="btn"><i class="fa fa-user-circle"></i></a>
                        <a title="Martin Danek" class="btn" style="color: #3b9c25;"><i class="fa fa-user-circle"></i></a>
                        <a title="Pan Jan" style="color: #1fedff;" class="btn"><i class="fa fa-user-circle"></i></a>
                        <a title="Jojo Celko" style="color: #00A000;" class="btn"><i class="fa fa-user-circle"></i></a>
                    </div>
                    <a title="Toggle fullscreen" ng-click="toggleFullScreen()" class="btn " ng-class="isFullscreen ? 'active' : ''"><i class="fa fa-expand-arrows-alt"></i></a>
                </div>
            </div>

            <div class="ie__tools">
                <div class="ie__panel__vertical">
                    <a title="" ng-class="activeTool == tools.select ? 'active' : '' " ng-click="setActiveTool(tools.select)" class="btn"><i class="fa fa-mouse-pointer"></i></a>
                    <a title="" ng-class="activeTool == tools.pencil ? 'active' : '' " ng-click="setActiveTool(tools.pencil)" class="btn"><i class="fa fa-pencil-alt"></i></a>
                    <a title="" ng-class="activeTool == tools.line ? 'active' : '' " ng-click="setActiveTool(tools.line)" class="btn"><big><b>\</b></big></a>
                    <a title="" ng-class="activeTool == tools.rectangle ? 'active' : '' " ng-click="setActiveTool(tools.rectangle)" class="btn"><i class="far fa-square" ng-click="addRect()"></i></a>
                    <a title="" ng-class="activeTool == tools.circle ? 'active' : '' " ng-click="setActiveTool(tools.circle)" class="btn"><i class="far fa-circle"></i></a>
                    <a title="" ng-class="activeTool == tools.polygon ? 'active' : '' " ng-click="setActiveTool(tools.polygon)" class="btn"><i class="far fa-star"></i></a>
                    <a title="" ng-class="activeTool == tools.text ? 'active' : '' " ng-click="setActiveTool(tools.text)" class="btn"><i class="fa fa-font"></i></a>
                    <div class="ie__container__picker btn">
                        <input id="fill" type="color"  bind-value-to="fill" ng-model="fillColor" style="display: none;">
                        <input id="stroke" type="color" bind-value-to="stroke" ng-model="strokeColor" style="display: none;">
                        <a title="" ng-click="openColorPicker('stroke')" class="ie__container__picker__stroke" style="color:{[getStrokeColor();]}"><i class="far fa-square"></i></a>
                        <a title="" ng-click="openColorPicker('fill')" class="ie__container__picker__background" style="color:{[getFillColor()]}"><i class="fa fa-square"></i></a>
                    </div>
                </div>
            </div>
            <div class="ie__options">
                <div class="ie__panel__vertical">

                    <!-- canvas properties-->
                    <div class="ie__options__canvas" ng-show="canvas.getActiveObject() == undefined">
                        <div class="ie__options__title">Canvas</div>
                        <div class="ie__tile__22">
                            <label>Width</label>
                            <input type="number" bind-value-to="canvasWidth">
                        </div>
                        <div class="ie__tile__22">
                            <label>Height</label>
                            <input type="number" bind-value-to="canvasHeight">
                        </div>
                        <div class="ie__tile__22">
                            <label>Background</label>
                            <input type="color" bind-value-to="canvasBgColor">
                        </div>
                    </div>

                    <!-- object default properties-->
                    <div class="ie__options__object" ng-show="canvas.getActiveObject() != undefined">
                        <div class="ie__options__title">{[canvas.getActiveObject().get('type')]}</div>
                        <div class="ie__tile__22">
                            <label>X coord</label>
                            <input type="number" bind-value-to="left">
                        </div>
                        <div class="ie__tile__22">
                            <label>Y coord</label>
                            <input type="number" bind-value-to="top">
                        </div>
                        <div class="ie__tile__22">
                            <label>Height</label>
                            <input type="number" bind-value-to="height">
                        </div>
                        <div class="ie__tile__22">
                            <label>Width</label>
                            <input type="number" bind-value-to="width">
                        </div>
                        <div class="ie__tile__22">
                            <label>Angle</label>
                            <input type="number" bind-value-to="angle" min="-360" max="360">
                        </div>
                        <div class="ie__tile__22">
                            <label>Opacity</label>
                            <input type="number" bind-value-to="opacity" min="0" max="100">
                        </div>

                        <div class="ie__options__title">Align</div>
                        <div class="ie__options__align">
                            <div class="ie__tile__11">
                                <a ng-click="setOriginX('left')" ng-class="getOriginX() == 'left' ? 'active' : ''" ><i class="fa fa-caret-square-left"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a ng-click="setOriginX('center')" ng-class="getOriginX() == 'center' ? 'active' : ''" ><i class="far fa-square"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a ng-click="setOriginX('right')" ng-class="getOriginX() == 'right' ? 'active' : ''" ><i class="fa fa-caret-square-right"></i></a>
                            </div>

                            <div class="ie__tile__11">
                                <a ng-click="setOriginY('top')" ng-class="getOriginY() == 'top' ? 'active' : ''" ><i class="fa fa-caret-square-up"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a ng-click="setOriginY('center')" ng-class="getOriginY() == 'center' ? 'active' : ''" ><i class="far fa-square"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a ng-click="setOriginY('bottom')" ng-class="getOriginY() == 'bottom' ? 'active' : ''" ><i class="fa fa-caret-square-down"></i></a>
                            </div>
                        </div>
                    </div>
                    <!-- canvas properties-->
                    <div class="ie__options__text" ng-show="canvas.getActiveObject().get('type') == 'textbox'">
                        <div class="ie__options__title">Font</div>
                        <div class="ie__tile__24">
                            <label>Font</label>
                            <select bind-value-to="fontFamily">
                                <option value="arial">Arial</option>
                                <option value="helvetica" selected="">Helvetica</option>
                                <option value="myriad pro">Myriad Pro</option>
                                <option value="delicious">Delicious</option>
                                <option value="verdana">Verdana</option>
                                <option value="georgia">Georgia</option>
                                <option value="courier">Courier</option>
                                <option value="comic sans ms">Comic Sans MS</option>
                                <option value="impact">Impact</option>
                                <option value="monaco">Monaco</option>
                                <option value="optima">Optima</option>
                                <option value="hoefler text">Hoefler Text</option>
                                <option value="plaster">Plaster</option>
                                <option value="engagement">Engagement</option>
                            </select>

                        </div>
                        <div class="ie__tile__11">
                            <a ng-click="toggleBold()" ng-class="isBold() == true ? 'active' : ''" ><i class="fa fa-bold"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a ng-click="toggleItalic()" ng-class="isItalic() == true ? 'active' : ''" ><i class="fa fa-italic"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a ng-click="toggleUnderline()" ng-class="isUnderline() == true ? 'active' : ''" ><i class="fa fa-underline"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a ng-click="toggleLinethrough()" ng-class="isLinethrough() == true ? 'active' : ''" ><i class="fa fa-strikethrough"></i></a>
                        </div>
                        <div class="ie__tile__22">
                            <label>Line h</label>
                            <input type="number" bind-value-to="lineHeight" min="0" step="0.1">
                        </div>
                        <div class="ie__tile__22">
                            <label>Font size</label>
                            <input type="number" bind-value-to="fontSize" min="0">
                        </div>
                    </div>

                    <!-- stroke properties-->
                    <div class="ie__options__stroke" ng-show="canvas.getActiveObject() != undefined">
                        <div class="ie__options__title">Stroke</div>
                        <div class="ie__tile__22">
                            <label>Width</label>
                            <input type="number" bind-value-to="strokeWidth" min="0">
                        </div>
                    </div>

                </div>
            </div>

        </div>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/fabric.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.utils.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.config.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.accessors.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.tools.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.keybindings.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.controller.js'></script>
        <?php
    }

} // class