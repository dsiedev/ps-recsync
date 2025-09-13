{*
* RecSync Admin Configuration Template
*}

<div class="panel">
    <div class="panel-heading">
        <i class="icon-cogs"></i> {l s='Configuración de RecSync' mod='recsync'}
    </div>
    
    <div class="panel-body">
        <div class="alert alert-info">
            <p><strong>{l s='RecSync - Recomendaciones Inteligentes' mod='recsync'}</strong></p>
            <p>{l s='Configure los parámetros del módulo RecSync para habilitar recomendaciones personalizadas de productos.' mod='recsync'}</p>
        </div>

        {if isset($recsync_config)}
        <form method="post" action="{$form_action|escape:'html':'UTF-8'}" class="form-horizontal">
            <input type="hidden" name="token" value="{$token|escape:'html':'UTF-8'}" />
            
            <div class="row">
                <div class="col-md-6">
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-wrench"></i> {l s='Configuración de API' mod='recsync'}
                        </div>
                        <div class="form-wrapper">
                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Activar Módulo' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_ENABLED" id="RECSYNC_ENABLED_on" value="1" {if $recsync_config.enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_ENABLED_on">{l s='Sí' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_ENABLED" id="RECSYNC_ENABLED_off" value="0" {if !$recsync_config.enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_ENABLED_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='URL de API' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="text" name="RECSYNC_API_URL" value="{$recsync_config.api_url|escape:'html':'UTF-8'}" class="form-control" required />
                                    <p class="help-block">{l s='URL base para la API de recomendaciones' mod='recsync'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='ID de Cliente' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="text" name="RECSYNC_CLIENT_ID" value="{$recsync_config.client_id|escape:'html':'UTF-8'}" class="form-control" required />
                                    <p class="help-block">{l s='Identificador de cliente para autenticación de API' mod='recsync'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Clave de API' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="password" name="RECSYNC_API_KEY" value="" class="form-control" placeholder="{l s='Ingrese nueva clave de API para actualizar' mod='recsync'}" />
                                    <p class="help-block">{l s='Clave actual: %s' sprintf=[$recsync_config.api_key] mod='recsync'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='API Timeout (ms)' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="number" name="RECSYNC_API_TIMEOUT" value="{$recsync_config.api_timeout|escape:'html':'UTF-8'}" class="form-control" min="100" max="10000" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='API Retries' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="number" name="RECSYNC_API_RETRIES" value="{$recsync_config.api_retries|escape:'html':'UTF-8'}" class="form-control" min="0" max="5" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Verify TLS' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_TLS_VERIFY" id="RECSYNC_TLS_VERIFY_on" value="1" {if $recsync_config.tls_verify}checked="checked"{/if} />
                                        <label for="RECSYNC_TLS_VERIFY_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_TLS_VERIFY" id="RECSYNC_TLS_VERIFY_off" value="0" {if !$recsync_config.tls_verify}checked="checked"{/if} />
                                        <label for="RECSYNC_TLS_VERIFY_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-th-large"></i> {l s='Widget Configuration' mod='recsync'}
                        </div>
                        <div class="form-wrapper">
                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Widget Title' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="text" name="RECSYNC_WIDGET_TITLE" value="{$recsync_config.widget_title|escape:'html':'UTF-8'}" placeholder="Recomendados para ti" class="form-control" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Product Limit' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="number" name="RECSYNC_WIDGET_LIMIT" value="{$recsync_config.widget_limit|escape:'html':'UTF-8'}" class="form-control" min="1" max="50" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Layout' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <select name="RECSYNC_WIDGET_LAYOUT" class="form-control">
                                        <option value="grid" {if $recsync_config.widget_layout == 'grid'}selected{/if}>{l s='Grid' mod='recsync'}</option>
                                        <option value="carousel" {if $recsync_config.widget_layout == 'carousel'}selected{/if}>{l s='Carousel' mod='recsync'}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Grid Columns' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="number" name="RECSYNC_WIDGET_COLUMNS" value="{$recsync_config.widget_columns|escape:'html':'UTF-8'}" class="form-control" min="2" max="6" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Exclude Out of Stock' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_EXCLUDE_OUT_OF_STOCK" id="RECSYNC_EXCLUDE_OUT_OF_STOCK_on" value="1" {if $recsync_config.exclude_out_of_stock}checked="checked"{/if} />
                                        <label for="RECSYNC_EXCLUDE_OUT_OF_STOCK_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_EXCLUDE_OUT_OF_STOCK" id="RECSYNC_EXCLUDE_OUT_OF_STOCK_off" value="0" {if !$recsync_config.exclude_out_of_stock}checked="checked"{/if} />
                                        <label for="RECSYNC_EXCLUDE_OUT_OF_STOCK_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Category Whitelist' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <input type="text" name="RECSYNC_CATEGORY_WHITELIST" value="{$recsync_config.category_whitelist|escape:'html':'UTF-8'}" class="form-control" placeholder="{l s='Comma-separated category IDs' mod='recsync'}" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Show Carousel Arrows' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_CAROUSEL_ARROWS" id="RECSYNC_CAROUSEL_ARROWS_on" value="1" {if $recsync_config.carousel_arrows}checked="checked"{/if} />
                                        <label for="RECSYNC_CAROUSEL_ARROWS_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_CAROUSEL_ARROWS" id="RECSYNC_CAROUSEL_ARROWS_off" value="0" {if !$recsync_config.carousel_arrows}checked="checked"{/if} />
                                        <label for="RECSYNC_CAROUSEL_ARROWS_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                    <p class="help-block">{l s='Show navigation arrows in carousel mode' mod='recsync'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Show Carousel Indicators' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_CAROUSEL_INDICATORS" id="RECSYNC_CAROUSEL_INDICATORS_on" value="1" {if $recsync_config.carousel_indicators}checked="checked"{/if} />
                                        <label for="RECSYNC_CAROUSEL_INDICATORS_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_CAROUSEL_INDICATORS" id="RECSYNC_CAROUSEL_INDICATORS_off" value="0" {if !$recsync_config.carousel_indicators}checked="checked"{/if} />
                                        <label for="RECSYNC_CAROUSEL_INDICATORS_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                    <p class="help-block">{l s='Show navigation indicators (dots) in carousel mode' mod='recsync'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-bar-chart"></i> {l s='Advanced Settings' mod='recsync'}
                        </div>
                        <div class="form-wrapper">
                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Enable Telemetry' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_TELEMETRY_ENABLED" id="RECSYNC_TELEMETRY_ENABLED_on" value="1" {if $recsync_config.telemetry_enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_TELEMETRY_ENABLED_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_TELEMETRY_ENABLED" id="RECSYNC_TELEMETRY_ENABLED_off" value="0" {if !$recsync_config.telemetry_enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_TELEMETRY_ENABLED_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Enable Debug' mod='recsync'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="RECSYNC_DEBUG_ENABLED" id="RECSYNC_DEBUG_ENABLED_on" value="1" {if $recsync_config.debug_enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_DEBUG_ENABLED_on">{l s='Yes' mod='recsync'}</label>
                                        <input type="radio" name="RECSYNC_DEBUG_ENABLED" id="RECSYNC_DEBUG_ENABLED_off" value="0" {if !$recsync_config.debug_enabled}checked="checked"{/if} />
                                        <label for="RECSYNC_DEBUG_ENABLED_off">{l s='No' mod='recsync'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                    <p class="help-block">{l s='Enable debug mode for detailed logging' mod='recsync'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <button type="submit" name="submitRecsyncConfig" class="btn btn-default pull-right">
                    <i class="process-icon-save"></i> {l s='Guardar' mod='recsync'}
                </button>
            </div>
        </form>
        {/if}
    </div>
</div>

<script>
$(document).ready(function() {
    // Add some JavaScript enhancements if needed
    console.log('RecSync Admin Configuration loaded');
});
</script>
