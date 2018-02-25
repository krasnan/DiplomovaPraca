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
        global $wgUser;
        $serverUrl = 'http://wiki.localhost';
        $serverPort = '3000';
        $userName = $wgUser->getName();
        $userEmail = $wgUser->getEmail();
        $roomName = isset($_GET['file']) ? $_GET['file'] : 'New File';
        ?>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/angular/angular.min.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/angular-bootstrap-colorpicker/bootstrap-colorpicker-module.min.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/socket.io-client/socket.io.js'></script>

        <div class="ie"  ng-app="ImageEditor" ng-controller="ImageEditor" ng-init="socketInit('<?php echo $serverUrl; ?>','<?php echo $serverPort; ?>','<?php echo $userName; ?>','<?php echo $roomName; ?>')">
            <div class="ie__container" ng-show="loaded">
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
                            <a ng-repeat="user in room.users" title="{[user.name]}" style="color: {[user.color]};" class="btn"><i class="fa fa-user-circle"></i></a>
                        </div>
                        <a title="Toggle fullscreen" ng-click="toggleFullScreen()" class="btn" ng-class="isFullscreen ? 'active' : ''"><i class="fa fa-expand-arrows-alt"></i></a>
                        <a title="Toggle messenger" ng-click="scrollDown('ie__messenger__messages'); messengerVisible = !messengerVisible; room.newMessage = false" class="btn" ng-class="room.newMessage && !messengerVisible ? 'text-primary' : ''"><i class="fa fa-comments"></i></a>
                        <div class="ie__messenger" ng-class="messengerVisible==true ? 'active' : ''">
                            <div class="ie__messenger__messages">
                                <div ng-repeat="message in room.messages" class="ie__messenger__item" ng-class="message.type=='system' ? 'system_message' : ''">
                                    <div ng-show="message.type === 'system'" class="ie__messenger__item__head">{[message.time]} | {[message.text]}</div>
                                    <div ng-show="message.type !== 'system'" class="ie__messenger__item__head">{[message.time]} | {[message.from]}</div>
                                    <span ng-show="message.type !== 'system'" class="ie__messenger__item__content">{[message.text]}</span>
                                </div>
                            </div>
                            <div class="ie__messenger__controll">
                                <input type="text" ng-model="message" placeholder="message...">
                                <a class="btn" ng-click="sendMessage(message)"><i class="fa fa-chevron-circle-right active"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ie__tools">
                    <div class="ie__panel__vertical">
                        <a title="Select Tool" ng-class="activeTool == tools.select ? 'active' : '' " ng-click="setActiveTool(tools.select)" class="btn"><i class="fa fa-mouse-pointer"></i></a>
                        <a title="Brush" ng-class="activeTool == tools.brush ? 'active' : '' " ng-click="setActiveTool(tools.brush)" class="btn"><i class="fa fa-paint-brush"></i></a>
                        <a title="Insert Image" ng-click="panels.file_upload.opened = true" class="btn"><i class="far fa-image"></i></a>
                        <a title="Line" ng-class="activeTool == tools.line ? 'active' : '' " ng-click="setActiveTool(tools.line)" class="btn"><big><b>\</b></big></a>
                        <a title="Rectangle" ng-class="activeTool == tools.rectangle ? 'active' : '' " ng-click="setActiveTool(tools.rectangle)" class="btn"><i class="far fa-square" ng-click="addRect()"></i></a>
<!--                        <a title="" ng-class="activeTool == tools.circle ? 'active' : '' " ng-click="setActiveTool(tools.circle)" class="btn"><i class="far fa-circle"></i></a>-->
                        <a title="Ellipse / Circle" ng-class="activeTool == tools.ellipse ? 'active' : '' " ng-click="setActiveTool(tools.ellipse)" class="btn"><i class="far fa-circle"></i></a>
                        <a title="Triangle" ng-class="activeTool == tools.triangle ? 'active' : '' " ng-click="setActiveTool(tools.triangle)" class="btn"><big>🛆</big></a>
                        <a title="Polygon" ng-class="activeTool == tools.polygon ? 'active' : '' " ng-click="setActiveTool(tools.polygon)" class="btn"><i class="far fa-star"></i></a>
                        <a title="Textbox" ng-class="activeTool == tools.text ? 'active' : '' " ng-click="setActiveTool(tools.text)" class="btn"><i class="fa fa-font"></i></a>
                        <div class="ie__container__picker btn">
                            <div title="Background Color" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="fillColor" ng-change="setFillColor(fillColor)" class="ie__container__picker__background" style="background:{[getFillColor()]}"></div>
                            <div title="Stroke Color" colorpicker="rgba" colorpicker-position="right" colorpicker-with-input="true" ng-model="strokeColor" ng-change="setStrokeColor(strokeColor)" class="ie__container__picker__stroke" style="background:{[getStrokeColor();]}">
                                <div class="ie__container__picker__stroke__inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ie__options">

                    <div class="ie__panel__vertical" ng-class="panels.layers.opened === true ? 'opened' : '' ">
                        <div class="ie__options__header">Layers <a class="ie__options__toggle" ng-click="panels.layers.opened = !panels.layers.opened"><i class="fa fa-angle-up"></i></a></div>
                        <div class="ie__options__body">
                            <div ng-repeat="layer in getLayers()" class="ie__tile__14" style="{[(room.users[layer.selectedBy] !== undefined ? 'border:' + room.users[layer.selectedBy].color + '1px solid' : '' )">
                                <div>
                                    <a ng-class="layer.selectable ? '' : 'disabled' " ng-click="selectObject(layer)"><i class="far " ng-class="layer.isSelected() ? 'fa-dot-circle' : 'fa-circle'"></i></a>
                                    {[layer.type]}
                                    <a ng-class="layer.selectable ? '' : 'disabled' " ng-click="deleteObject(layer)" class="pull-right"><i class="fa fa-trash"></i></a>
                                </div>

                            </div>

                            <div class="ie__tile__11">
                                <a title="Group selected objects" ng-class="canvas.getActiveObjects().length>0 ? 'text-primary' : 'disabled' " ng-click="" ><i class="far fa-object-group"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a title="Ungroup selected objects" ng-class="canvas.getActiveObjects().length>0 ? 'text-primary' : 'disabled' " ng-click="" ><i class="far fa-object-ungroup"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a title="Select all objects" ng-click="selectAllObjects()" class="text-primary"><i class="far fa-check-square"></i></a>
                            </div>
                            <div class="ie__tile__11">
                                <a title="Deselect all objects" ng-class="canvas.getActiveObjects().length>0 ? 'text-primary' : 'disabled' " ng-click="canvas.discardActiveObject();" ><i class="far fa-minus-square"></i></a>
                            </div>
                        </div>

                    </div>

                    <div class="ie__panel__vertical" ng-class="panels.properties.opened === true ? 'opened' : '' ">
                        <div class="ie__options__header">Options <a class="ie__options__toggle" ng-click="panels.properties.opened = !panels.properties.opened"><i class="fa fa-angle-up"></i></a></div>
                        <div class="ie__options__body">
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


                    <div class="ie__panel__vertical" ng-class="panels.font.opened === true ? 'opened' : '' " ng-show="canvas.getActiveObject().get('type') == 'textbox'">
                        <div class="ie__options__text">
                            <div class="ie__options__header">Font <a class="ie__options__toggle" ng-click="panels.font.opened = !panels.font.opened"><i class="fa fa-angle-up"></i></a></div>
                            <div class="ie__options__body">

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
                        </div>

                    </div>

                    <div class="ie__panel__vertical" ng-class="panels.brush.opened === true ? 'opened' : '' " ng-show="canvas.isDrawingMode">
                        <div class="ie__options__text">
                            <div class="ie__options__header">Brush <a class="ie__options__toggle" ng-click="panels.brush.opened = !panels.brush.opened"><i class="fa fa-angle-up"></i></a></div>
                            <div class="ie__options__body">
                                <div class="ie__tile__24">
                                    <label>Brush</label>
                                    <select title="" ng-init="brushType='Pencil'" ng-model="brushType" ng-change="setFreeDrawingBrush(brushType)">
                                        <option value="Pencil">Pencil</option>
                                        <option value="Circle">Circle</option>
                                        <option value="Spray">Spray</option>
                                    </select>
                                </div>
                                <div class="ie__tile__22">
                                    <label>Brush size</label>
                                    <input title="" type="number" min="1" step="1" ng-model="canvas.freeDrawingBrush.width">
                                </div>
                                <div class="ie__options__title">Shadow</div>
                                <div class="ie__tile__22">
                                    <label>Blur</label>
                                    <input title="" type="number" min="0" step="1" ng-model="canvas.freeDrawingBrush.shadow.blur">
                                </div>
                                <div class="ie__tile__22">
                                    <label>Color</label>
                                    <div title="" colorpicker="rgba" colorpicker-position="left" colorpicker-with-input="true" ng-model="canvas.freeDrawingBrush.shadow.color" class="ie__colorpicker" style="background:{[canvas.freeDrawingBrush.shadow.color]}"></div>

                                    <!--                            <input type="color" bind-value-to="canvasBgColor">-->
                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="ie__panel__vertical" ng-class="panels.image.opened === true ? 'opened' : '' " ng-show="canvas.getActiveObject().get('type') == 'textbox'">
                        <div class="ie__options__text">
                            <div class="ie__options__header">Image <a class="ie__options__toggle" ng-click="panels.image.opened = !panels.image.opened"><i class="fa fa-angle-up"></i></a></div>
                            <div class="ie__options__body">
                            </div>
                        </div>
                    </div>


                </div>

                <div class="ie__modal" ng-show="panels.file_upload.opened === true">
                    <div class="ie__modal__container">
                        <div class="ie__modal__header">Upload Image <a class="btn" ng-click="panels.file_upload.opened = false"><i class="far fa-times-circle"></i></a></div>
                        <div class="ie__modal__body">
                            <input class="hidden" files-input ng-model="new_file"  id="file_upload" type="file" accept=".jpg, .png, .jpeg, .svg">
                            <label class="btn-white" for="file_upload"><i class="fa fa-upload"></i> {[ new_file.name ? new_file.name : 'Select File'  ]}</label>
                        </div>
                        <div class="ie__modal__footer">
<!--                            <div class="btn btn-danger" ng-click="panels.file_upload.opened = false">Cancel</div>-->
                            <div class="btn-primary" ng-click="panels.file_upload.opened = false; loadImage(new_file);">Insert</div>
                        </div>
                    </div>
                </div>

                <div class="ie__modal" ng-show="panels.modal.opened === true">
                    <div class="ie__modal__container">
                        <div class="ie__modal__header">{[panels.modal.header]}<a class="btn" ng-click="panels.modal.opened = false"><i class="far fa-times-circle"></i></a></div>
                        <div class="ie__modal__body">
                            {[panels.modal.text]}
                        </div>
                        <div class="ie__modal__footer">
                            <a class="btn-danger" ng-show="panels.modal.cancelText != undefined" ng-click="panels.modal.cancel();panels.modal.opened = false">{[panels.modal.cancelText]}</a>
                            <a class="btn-primary" ng-show="panels.modal.successText != undefined" ng-click="panels.modal.success();panels.modal.opened = false">{[panels.modal.successText]}</a>
                        </div>
                    </div>
                </div>

            </div>


        </div>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/vendor/fabricjs2/fabric.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.utils.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.config.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.accessors.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.tools.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.init.keybindings.js'></script>
        <script src='<?php echo $wgScriptPath ?>/extensions/ImageEditor/modules/scripts/ext.imageEditor.controller.js'></script>
        <?php
    }

} // class