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
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/angular/angular.min.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/angular-bootstrap-colorpicker/bootstrap-colorpicker-module.min.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/socket.io-client/socket.io.js'></script>

        <script !src="">
            function getFileName(){
                return location.href.search();
            }

            // var socket = io.connect('http://wiki.localhost:3000', {query:'name=krasnan&room=roomName'});


            // socket.on('connect', function(){
            //     socket.emit('joinRoom', 'room_name', 'user_name');
            // });
            // socket.on('addUser', function(data){console.log(data)});
            // socket.on('disconnect', function(){});
        </script>

        <div class="ie"  ng-app="ImageEditor" ng-controller="ImageEditor">

            <div class="ie__playground">
                <div class="ie__playground__container">
                    <canvas id="ie__canvas" width="800" height="600"></canvas>
                </div>
            </div>

            <div class="ie__info">
                <div class="ie__panel__horizontal">
<!--                    <input class="input" type="text" placeholder="Image Name...">-->
                    <div class="ie__dropdown">
                        <a title="" class="btn ie__dropdown__btn" ng-click="">File</a>
                        <div class="ie__dropdown__list">
                            <a title="" class="btn" ng-click="rasterize($event,'export.png')">Export as PNG</a>
                            <a title="" class="btn" ng-click="rasterizeSVG($event,'export.svg')">Export as SVG</a>

                            <a title="" class="btn">Save</a>
                            <a title="" class="btn" ng-click="">Close</a>
                        </div>
                    </div>
                    <div class="ie__dropdown">
                        <a title="" class="btn ie__dropdown__btn" ng-click="">Edit</a>
                        <div class="ie__dropdown__list">
                            <a title="" class="btn" ng-click="cut()">Cut<span>ctrl + x</span></a>
                            <a title="" class="btn" ng-click="copy()">Copy<span>ctrl + c</span></a>
                            <a title="" class="btn" ng-click="paste()">Paste<span>ctrl + v</span></a>
                            <a title="" class="btn" ng-click="duplicate()">Duplicate</a>
                            <a title="" class="btn" ng-click="deleteSelection()">Delete<span>del</span></a>
                        </div>
                    </div>
                    <div class="ie__dropdown">
                        <a title="" class="btn ie__dropdown__btn" ng-click="">Object</a>
                        <div class="ie__dropdown__list">
                            <a title="" class="btn" ng-click="bringToFront()">Bring to Front <span>ctrl + shift + ↑</span></a>
                            <a title="" class="btn" ng-click="bringForward()">Bring Forward <span>ctrl + ↑</span></a>
                            <a title="" class="btn" ng-click="sendBackwards()">Send Backward <span>ctrl + ↓</span></a>
                            <a title="" class="btn" ng-click="sendToBack()">Send to Back <span>ctrl + shift + ↓</span></a>

                        </div>
                    </div>


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
                    <a title="" ng-class="activeTool == tools.brush ? 'active' : '' " ng-click="setActiveTool(tools.brush)" class="btn"><i class="fa fa-pencil-alt"></i></a>
                    <a title="" ng-class="activeTool == tools.line ? 'active' : '' " ng-click="setActiveTool(tools.line)" class="btn"><big><b>\</b></big></a>
                    <a title="" ng-class="activeTool == tools.rectangle ? 'active' : '' " ng-click="setActiveTool(tools.rectangle)" class="btn"><i class="far fa-square" ng-click="addRect()"></i></a>
                    <a title="" ng-class="activeTool == tools.circle ? 'active' : '' " ng-click="setActiveTool(tools.circle)" class="btn"><i class="far fa-circle"></i></a>
                    <a title="" ng-class="activeTool == tools.polygon ? 'active' : '' " ng-click="setActiveTool(tools.polygon)" class="btn"><i class="far fa-star"></i></a>
                    <a title="" ng-class="activeTool == tools.text ? 'active' : '' " ng-click="setActiveTool(tools.text)" class="btn"><i class="fa fa-font"></i></a>
                    <div class="ie__container__picker btn">
                        <div title="" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="fillColor" ng-change="setFillColor(fillColor)" class="ie__container__picker__background" style="background:{[getFillColor()]}"></div>
                        <div title="" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="strokeColor" ng-change="setStrokeColor(strokeColor)" class="ie__container__picker__stroke" style="background:{[getStrokeColor();]}">
                            <div class="ie__container__picker__stroke__inner"></div>
                        </div>
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
                            <input title="" type="number" bind-value-to="canvasWidth">
                        </div>
                        <div class="ie__tile__22">
                            <label>Height</label>
                            <input title="" type="number" bind-value-to="canvasHeight">
                        </div>

                        <div class="ie__tile__22">
                            <label>Background</label>
                            <div title="" colorpicker="rgba" colorpicker-position="left" colorpicker-with-input="true" ng-model="canvasBgColor" ng-change="setCanvasBgColor(canvasBgColor)" class="ie__colorpicker" style="background:{[getCanvasBgColor()]}"></div>

                            <!--                            <input type="color" bind-value-to="canvasBgColor">-->
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
                            <select title="" bind-value-to="fontFamily">
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
                            <a title="" ng-click="toggleBold()" ng-class="isBold() == true ? 'active' : ''" ><i class="fa fa-bold"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a title="" ng-click="toggleItalic()" ng-class="isItalic() == true ? 'active' : ''" ><i class="fa fa-italic"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a title="" ng-click="toggleUnderline()" ng-class="isUnderline() == true ? 'active' : ''" ><i class="fa fa-underline"></i></a>
                        </div>
                        <div class="ie__tile__11">
                            <a title="" ng-click="toggleLinethrough()" ng-class="isLinethrough() == true ? 'active' : ''" ><i class="fa fa-strikethrough"></i></a>
                        </div>
                        <div class="ie__tile__22">
                            <label>Line h</label>
                            <input title="" type="number" bind-value-to="lineHeight" min="0" step="0.1">
                        </div>
                        <div class="ie__tile__22">
                            <label>Font size</label>
                            <input title="" type="number" bind-value-to="fontSize" min="0">
                        </div>

                    </div>
                    <div class="ie__options__freedraw" ng-show="activeTool == tools.brush">

                        <div class="ie__options__title">{[canvas.getActiveObject().get('type')]}</div>
                        <div class="ie__tile__22">
                            <label>Brush</label>
                            <input type="number" bind-value-to="left">
                        </div>
                    </div>
                    <!-- stroke properties-->
                    <div class="ie__options__stroke" ng-show="canvas.getActiveObject() != undefined">
                        <div class="ie__options__title">Stroke</div>
                        <div class="ie__tile__22">
                            <label>Width</label>
                            <input title="" type="number" bind-value-to="strokeWidth" min="0">
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/fabricjs/fabric.min.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.utils.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.config.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.accessors.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.tools.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.keybindings.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.controller.js'></script>
        <?php
    }

} // class