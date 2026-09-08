function createTable(knex){
  // knex.schema.withSchema('public').alterTable('fluid_props', function(t) {
  //   t.string('viscosity_cp', 16).nullable().alter();
  //   t.string('viscosity_uom', 35).nullable().alter();
  // }).then((d) => { 
  // });



    /* sizing data table */
    knex.schema.hasTable('sizing_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('sizing_data', function(t) {      
          t.increments('sd_id');
          t.string('sizing_id', 16).notNullable();
          t.integer('rev_num', 16).notNullable();
          t.string('sizing_basis', 255).nullable();
          t.string('product_type', 255).nullable();
          t.string('service_type', 255).nullable();
          t.string('code', 255).nullable();
          t.string('k_a_dataset', 50).nullable();
          t.string('model', 50).nullable();
          t.string('model_id', 50).nullable();
          t.string('user_email', 200).nullable();
          t.string('tag_num', 50).nullable();
          t.string('p_id', 16).nullable();
          t.string('service', 50).nullable();
          t.string('line_num', 16).nullable();
          t.integer('quantity', 16).nullable();
          t.string('calc_method', 255).nullable();
          t.string('display_unit_system', 255).nullable();
          t.string('2Phase_API_DisCoeff', 255).nullable();
          t.string('reason', 255).nullable();
          t.string('prep_by', 50).nullable();
          t.string('checked_by', 50).nullable();
          t.string('approved_by', 50).nullable();
          t.string('created_by', 50).nullable();
          t.timestamp('created_at', 50).defaultTo(knex.fn.now());
          t.string('panel_activation', 255).nullable();
          t.string('brand', 25).nullable();
          t.string('valve_type', 25).nullable();
          t.string('valve_type_desc', 255).nullable();
          t.string('size_orifice', 25).nullable();
          t.boolean('isSuperUserChecked').nullable();
          t.jsonb('superUserData').nullable();
          t.string('a', 25).nullable();
          t.string('aapi', 25).nullable();
          t.string('areq', 25).nullable();
          t.string('inlet_size', 25).nullable();
          t.string('k', 25).nullable();
          t.string('kapi', 25).nullable();
          t.string('kb', 25).nullable();
          t.string('kd', 25).nullable();
          t.string('kmax', 25).nullable();
          t.string('outlet_size', 25).nullable();
          t.string('size_code', 25).nullable();
          t.string('vact', 25).nullable();
          t.string('valve_function', 25).nullable();
          t.string('valve_orifice', 25).nullable();
          t.string('vrtd', 25).nullable();
          t.string('wact', 25).nullable();
          t.string('wrtd', 25).nullable();
          t.string('newv', 25).nullable();
        }).then((d) => { 
        });
      }
    })

    //fluid properties data table
    knex.schema.hasTable('fluid_props').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('fluid_props', function(t) {      
          t.increments('fluid_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.string('fluid_name', 255).nullable();
          t.string('is_sat_steam', 100).nullable();
          t.string('is_wet_steam', 100).nullable();
          t.string('steam_dry_factor', 100).nullable();
          t.decimal('mol_wt_p', 100, 50).nullable();
          t.decimal('sp_gravity_p', 100, 50).nullable();
          t.decimal('ratio_SpHeat_k_p', 100, 50).nullable();
          t.decimal('compressibility_p', 100, 50).nullable();
          t.string('isentropic_exp', 100).nullable();
          t.string('viscosity_cp', 100).nullable();
          t.string('viscosity_uom', 100).nullable();  
          
          
          t.string('is_liquid_at_inlet', 100).nullable();
          t.string('gas_density', 100).nullable();
          t.string('gas_specific_volume', 100).nullable();
          t.string('liquid_density', 100).nullable();
          t.string('liquid_density_inlet', 100).nullable();
          t.string('liquid_specific_volume', 100).nullable();
          t.string('mass_flux', 100).nullable();
          t.string('mass_flux_choosen', 100).nullable();
          t.string('density_uom', 100).nullable();
          t.string('sp_volume_uom', 100).nullable();
          t.string('vapor_saturation_pressure', 100).nullable();
          t.string('mass_flux_uom', 100).nullable();
          t.string('mix_density_sat', 100).nullable();
          t.string('sp_volume_sat', 100).nullable();

          t.string('fluid_name_v', 255).nullable();
          t.decimal('mol_wt_v', 100, 50).nullable();
          t.decimal('sp_gravity_v', 100, 50).nullable();
          t.decimal('ratio_SpHeat_k_v', 100, 50).nullable();
          t.decimal('compressibility_v', 100, 50).nullable();
          t.string('is_custom_fluid', 100).nullable();
          t.string('combined_sp_vol_p1', 100).nullable();
          t.string('combined_sp_vol_inlet', 100).nullable();
          t.string('vapor_pressure', 100).nullable();
          t.string('gas_partial_pressure', 100).nullable();
          t.string('gas_vap_com_sp_vol', 100).nullable();
          t.string('latent_heat', 100).nullable();
          t.string('latent_heat_unit', 100).nullable();
          t.string('liq_Spec_heat_inlet', 100).nullable();
          t.string('liq_Spec_heat_inlet_uom', 100).nullable();
          t.string('omega', 100).nullable();
          t.string('sp_vol_sat_uom', 100).nullable();
          t.string('saturated_vapor_Sp_Vol', 100).nullable();
          t.string('saturated_liquid_Sp_Vol', 100).nullable();
          t.string('is_liquid_2', 100).nullable();
          t.string('liquid_1_fluid_name', 100).nullable();
          t.string('liquid_2_fluid_name', 100).nullable();
          t.string('sp_gravity_2', 100).nullable();
          t.string('viscosity_2', 100).nullable();
          t.string('pressure_checkbox', 100).nullable();
          t.string('vaccum_checkbox', 100).nullable();
          t.string('vaccum_fluidname', 100).nullable();
          t.string('vaccum_k', 100).nullable();
          t.string('vaccum_compressibility', 100).nullable();
          t.string('vaccum_molecular', 100).nullable();
        }).then((d) => { 
        });
      }
    })
    
    //temperature data table
    knex.schema.hasTable('temp_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('temp_data', function(t) {      
          t.increments('temp_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.decimal('relieve_temp', 100, 50).nullable();
          t.decimal('relieve_temp_v', 100, 50).nullable();
          t.decimal('sat_steam_temp', 100, 50).nullable();
          t.decimal('opr_temp', 100, 50).nullable();
          t.decimal('designMin_temp', 100, 50).nullable();
          t.decimal('designMax_temp', 100, 50).nullable();
          t.decimal('NormalSys_temp', 100, 50).nullable();
          t.decimal('vessel_wall_temp', 100, 50).nullable();
          t.string('temp_uom', 100).nullable();
          t.decimal('relieving_forPress', 100).nullable();
          t.string('relieving_forVacc', 100).nullable();
          t.string('normal_operating', 100).nullable();
          t.string('maximum_operating', 100).nullable();
          t.decimal('boiling_point', 100, 50).nullable();
          t.decimal('flash_point', 100, 50).nullable();
        }).then((d) => { 
        });
      }
    })

    //generic data table
    knex.schema.hasTable('generic_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('generic_data', function(t) {      
          t.increments('generic_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.string('generic_brand', 100).nullable();
          t.string('generic_model', 100).nullable();
          t.string('generic_orifice', 100).nullable();
          t.string('generic_orifice_area', 100).nullable();
          t.string('distance_from_valve', 100).nullable();
          t.string('inlet_diameter', 100).nullable();
          t.string('outlet_diameter', 100).nullable();
          t.string('k', 100).nullable();
          t.string('kd', 100).nullable();
          t.string('kw', 100).nullable();
          t.string('kb', 100).nullable();
          t.string('a', 100).nullable();
          t.string('b', 100).nullable();
          t.string('c', 100).nullable();
          t.string('weight', 100).nullable();
          t.string('is_dual_outlet', 100).nullable();
          t.string('ka_dataset_generic', 100).nullable();
          t.string('kRadio', 100).nullable();
          t.string('weight_unit', 100).nullable();
          t.string('orifice_area_unit', 100).nullable();
          t.string('dimension_unit_inlet_outlet', 100).nullable();
          t.string('dimension_unit_ABC', 100).nullable();
          t.string('dimensions_unit', 100).nullable();
        }).then((d) => { 
        });
      }
    })

    //system data table
    knex.schema.hasTable('system_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('system_data', function(t) {      
          t.increments('system_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          // t.string('fluid_name', 50).nullable();
          t.string('comp_system', 100).nullable();
          t.string('cb_wtOfHydLt', 100).nullable();
          t.string('isFarFromCritPt', 100).nullable();
          t.string('critTemp', 100).nullable();
          t.string('critPress', 100).nullable();
          t.string('boiling_range', 100).nullable();
          t.string('system_condition', 100).nullable();
          t.string('isFarCritPt_errStatus', 100).nullable();
          t.string('boiling_range_errStatus', 100).nullable();
        }).then((d) => { 
        });
      }
    })

    //pump data table
    knex.schema.hasTable('pump_data').then(function(exists) { 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('pump_data', function(t) {      
          t.increments('pump_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.string('normal_process', 100).nullable();
          t.string('maximum_process', 100).nullable();
          t.string('recirculation', 100).nullable();
        }).then((d) => { 
        });
      }
    })    

    //pressure data table
    knex.schema.hasTable('pressure_data').then(function(exists) { 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('pressure_data', function(t) {      
          t.increments('pres_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.decimal('atm_pressure', 100, 50).nullable();
          t.string('atm_pressure_uom', 100).nullable();
          t.decimal('sys_mawp', 100, 50).nullable();
          t.decimal('opr_pressure', 100, 50).nullable();
          t.decimal('set_pressure', 100, 50).nullable();
          t.decimal('over_pressure_per', 100, 50).nullable();
          t.decimal('over_pressure', 100, 50).nullable();
          t.decimal('builtUp_bk_pressure', 100, 50).nullable();
          t.decimal('const_supimp_bk_pressure', 100, 50).nullable();
          t.decimal('var_supimp_bk_pressure', 100, 50).nullable();
          t.decimal('total_bk_pressure', 100, 50).nullable();
          t.decimal('inlet_pres_loss_per', 100, 50).nullable();
          t.decimal('inlet_pres_loss', 100, 50).nullable();
          t.string('pressure_uom', 100).nullable();
          t.decimal('sys_mawv', 100, 50).nullable();
          t.decimal('set_vaccum', 100, 50).nullable();
          t.decimal('under_press_v_per', 100, 50).nullable();
          t.decimal('under_press_v', 100, 50).nullable();
          t.string('vaccum_uom', 100).nullable();
          t.decimal('vessel_press', 100, 50).nullable();
          t.string('vessel_vaccum', 100).nullable();
          t.decimal('delta_press', 100, 50).nullable();
          t.string('delta_vaccum', 100).nullable();
          t.string('pump_pres_shutoff', 100).nullable();
          t.string('pump_pres_normal', 100).nullable();
          t.string('pump_pres_recirculation', 100).nullable();
          t.string('existing_bypass', 100).nullable();
          /*overpressure*/
          t.jsonb('over_pressure_calc_values').nullable();
          t.boolean('is_over_pressure_disabled').nullable();
          t.string('inlet_pressure', 100).nullable();
          t.string('steam_condition', 100).nullable();
        }).then((d) => { 
        });
      }
    })


    //sizing misc data table
    knex.schema.hasTable('sizing_misc_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('sizing_misc_data', function(t) {      
          t.increments('misc_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.decimal('req_pressure_flow', 100, 50).nullable();
          t.string('req_pressure_flow_uom', 100).nullable();
          t.string('has_rupture_disc', 100).nullable();
          t.string('flow_capacity_uom', 100).nullable();
          t.decimal('kc', 100, 50).nullable();
          t.string('is_flamearrestor_included', 100).nullable();
          t.string('is_section_VIII', 100).nullable();
          t.decimal('fd', 100, 50).nullable();
          t.string('is_viscosity_enabled', 100).nullable();
          t.string('condensation_value', 100).nullable();
          t.string('thermodynamic_critical_value', 100).nullable();
          t.decimal('vapor_flow', 100, 50).nullable();
          /*added ma length*/
          t.decimal('liquid_flow', 100, 50).nullable();
          t.decimal('liquid_two_flow', 100, 50).nullable();
          t.decimal('kv', 100, 50).nullable();
          t.string('vaccum_flow', 100).nullable();
          t.string('is_free_vent', 100).nullable();
          t.string('is_flame_arrester', 100).nullable();
          /*added new fields for resizing*/
          t.jsonb('radio_molecular').nullable();
          t.jsonb('radio_multi_inside').nullable();
          t.jsonb('radio_liquid').nullable();
          t.jsonb('radio_mix').nullable();
          t.jsonb('radio_single').nullable();
          t.jsonb('radio_single_inside').nullable();
          t.string('radio_over_pressure', 100).nullable();
          t.string('radio_inlet_loss', 100).nullable();
          t.decimal('gas_flow', 100, 50 ).nullable() ; 
          /* added flowCapacityrender */
          t.boolean('flow_capacity_render').nullable();
          /* add prefernce */
          t.jsonb('preference_details').nullable();
          t.jsonb('general_settings').nullable();
          t.jsonb('tag_notes').nullable();
          t.jsonb('misc_properties').nullable();
          t.jsonb('fluid_errors').nullable();
        }).then((d) => { 
        });
      }
    })


    //calc details table
    knex.schema.hasTable('calc_details').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('calc_details', function(t) {      
          t.increments('calc_id');
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.decimal('inlet_pres_p1', 100, 50).nullable();
          t.decimal('outlet_pres_p2', 100, 50).nullable();
          t.decimal('pres_ratio_pr', 100, 50).nullable();
          t.decimal('sub_critical_flow_factor_fs', 100, 50).nullable();
          t.decimal('over_pres_ratio_x', 100, 50).nullable();
          t.decimal('discharge_coefficient_kd', 100, 50).nullable();
          t.string('pressure_calc_uom', 100).nullable();
          t.decimal('vol_flow_v', 100, 50).nullable();
          t.string('vol_flow_calc_uom', 100).nullable();
          t.decimal('orifice_size', 100, 50).nullable();
          t.string('orifice_size_uom', 100).nullable();
         t.string('orifice_area', 100).nullable();
          t.string('orifice_area_uom', 100).nullable();
          t.decimal('mass_flow_w', 100, 50).nullable();
          t.string('mass_flow_w_uom', 100).nullable();
          t.decimal('noise_level_l100', 100, 50).nullable();
          t.string('noise_level_l100_uom', 100).nullable();
        }).then((d) => { 
        });
      }
    })
    
    //User details table
    knex.schema.hasTable('user_details').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('user_details', function(t) {      
          t.increments('user_id');
          t.string('user_email', 200).nullable();
          t.string('user_name', 100).nullable();
          
        }).then((d) => { 
        });
      }
    })
    
    //User Preference details table
    knex.schema.hasTable('preference_details').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('preference_details', function(t) {      
          t.increments('pref_id');
          t.integer("user_id").unsigned();
          t.foreign("user_id").references("user_details.user_id");
          t.string('pref_display_unit', 100).nullable();
          t.string('pref_calc_method', 100).nullable();
          t.string('pref_atm_pressure', 100).nullable();
          t.string('pref_atm_pressure_uom', 100).nullable();
          t.string('pref_pressure_uom', 100).nullable();
          t.string('pref_temperature_uom', 100).nullable();
          t.string('pref_liquid_viscosity_uom', 100).nullable();
          t.string('pref_specific_heat_uom', 100).nullable();
          t.string('pref_mass_flux_uom', 100).nullable();
          t.string('pref_specific_volume_uom', 100).nullable();
          t.string('pref_latent_ht_vapour_uom', 100).nullable();
          t.string('pref_density_uom', 100).nullable();
          t.string('pref_heat_input_uom', 100).nullable();
          t.string('pref_gas_uom', 100).nullable();
          t.string('pref_api_fire_uom', 100).nullable();
          t.string('pref_liquid_uom', 100).nullable();
          t.string('pref_two_phase_uom', 100).nullable();
          t.string('pref_steam_uom', 100).nullable();
          t.string('pref_subcooled_uom', 100).nullable();
          t.string('pref_single_data_set_uom', 100).nullable();
          t.string('pref_multi_data_set_uom', 100).nullable();
          t.string('pref_orific_area_uom', 100).nullable();
          t.string('pref_reaction_force_uom', 100).nullable();
          t.string('pref_dimension_uom', 100).nullable();
          t.string('pref_weight_uom', 100).nullable();
          t.string('pref_distance_valve', 100).nullable();
          t.string('pref_distance_valve_uom', 100).nullable();
          t.string('pref_dimensions_uom', 100).nullable();
          t.string('pref_surface_area_uom', 100).nullable();
          t.string('pref_volume_uom', 100).nullable();
          t.boolean('pref_seventh_check').nullable();
          t.boolean('pref_sixth_check').nullable();
        }).then((d) => { 
        });
      }
    });

    // required_flow_data - Fire size tank
    knex.schema.hasTable('required_flow_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('required_flow_data', function(t) {      
          t.increments('req_flow_id');
          //t.uuid('calc_id', 16).primary();
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.string('fire_sizing_method', 100).nullable();
          t.string('is_calcualate_fire_sizing_factor', 100).nullable();          
          t.decimal('environmental_factor_tank', 100, 50).nullable();
          t.decimal('fire_sizing_factor', 100, 50).nullable();
          // t.decimal('operating', 50, 10).nullable();
          // t.string('operating_unit', 16).nullable();
          // t.decimal('operating_pressure', 50, 10).nullable();
          // t.string('operating_pressure_unit', 16).nullable();
          t.decimal('latent_heat_tank',100,50).nullable();
          t.decimal('wetted_area_tank',100,50).nullable();
          t.decimal('wetted_area', 100, 50).nullable();
          t.decimal('surface_area', 100, 50).nullable();
          t.string('area_unit', 100).nullable();
          t.string('area_unit_tank', 100).nullable();
          t.decimal('additional_capacity_pressure_tank', 100, 50).nullable();
          t.string('additional_capacity_pressure_unit_tank', 100).nullable();
          t.string('is_propt_ff_ea_exist', 100).nullable();
          t.decimal('vol_flow_v', 100, 50).nullable();
          t.string('vol_flow_calc_uom', 100).nullable();
          //Why latent heat and unit is stored here when it is part of fluuid properties Flashing liquid + vpor + gas (d.2.3)
          t.decimal('latent_heat_req_flow', 100, 50).nullable();
          t.string('latent_heat_unit_req_flow', 100).nullable();
         // t.decimal('required_pressure_flow', 50, 10).nullable();
        }).then((d) => { 
        });
      }
    })

    knex.schema.hasTable('tank_data').then(function(exists) {
 
      if (!exists) {
        return knex.schema.withSchema('public').createTable('tank_data', function(t) {      
          t.increments('tank_data_id');
          //t.uuid('calc_id', 16).primary();
          t.integer('sd_id').unsigned();
          t.foreign('sd_id').references('sizing_data.sd_id');
          t.string('tank_shape', 100).nullable();
          t.decimal('diameter', 100, 50).nullable();
          t.decimal('fire_sizing_factor', 100, 50).nullable();
          t.decimal('elevation', 100, 50).nullable();
          t.decimal('liquid_depth',  100, 50).nullable();
          t.decimal('length_end_end_lt', 100, 50).nullable();
          t.string('tank_data_unit', 100).nullable();
          t.string('orientation', 100).nullable();
          t.string('ends', 100).nullable();
          //added radio button value
          t.string('length_radio', 100).nullable();
          t.decimal('height', 100, 50).nullable();
          t.decimal('length_seem_seem_ls', 100, 50).nullable();
          t.decimal('vessel_width', 100, 50).nullable();
          t.decimal('bottom_plate', 100, 50).nullable();
        }).then((d) => { 
        });
      }
    })

  //Valve Note


  knex.schema.hasTable('valve_note').then(function(exists) {
    if (!exists) {
      return knex.schema.withSchema('public').createTable('valve_note', function(t) {      
        t.increments('note_id');
        t.integer('sd_id').unsigned();
        t.foreign('sd_id').references('sizing_data.sd_id');
        t.text('note').nullable();
        t.boolean('checked').nullable();
      }).then(() => { 
      });
    }
  })  

  // flow_rate_data - API 2000, Free Vent, Pressure Relief
  knex.schema.hasTable('flow_rate_data').then(function(exists) {
 
    if (!exists) {
      return knex.schema.withSchema('public').createTable('flow_rate_data', function(t) {      
        t.increments('flow_rate_id');
        t.integer('sd_id').unsigned();
        t.foreign('sd_id').references('sizing_data.sd_id');
        t.string('flow_rate_capacity_method', 100).nullable();
        t.jsonb('boil_flash_radio').nullable();
        t.jsonb('flow_rate_radio').nullable();
        t.decimal('additional_capacity_pressure', 100, 50).nullable();
        t.string('additional_capacity_pressure_unit', 100).nullable();
        t.decimal('additional_capacity_vacuum', 100, 50).nullable();
        t.string('additional_capacity_vacuum_unit', 100).nullable();
        t.decimal('product_movement_pressure', 100, 50).nullable();
        t.string('product_movement_pressure_unit', 100).nullable();
        t.decimal('product_movement_vacuum', 100, 50).nullable();
        t.string('product_movement_vacuum_unit', 100).nullable();
        t.decimal('thermal_pressure', 100, 50).nullable();
        t.string('thermal_pressure_unit', 100).nullable();
        t.decimal('thermal_vacuum', 100, 50).nullable();
        t.string('thermal_vacuum_unit', 100).nullable();
        t.decimal('required_flow_pressure', 100, 50).nullable();
        t.string('required_flow_pressure_unit', 100).nullable();
        t.decimal('required_flow_vacuum', 100, 50).nullable();
        t.string('required_flow_vacuum_unit', 100).nullable();
        t.string('product_in_tank', 100).nullable();
        t.decimal('latent_heat_of_vapor', 100, 50).nullable();
        t.string('latent_heat_of_vapor_unit', 100).nullable();
        t.decimal('environmental_factor', 100, 50).nullable();
        t.decimal('wetted_area', 100, 50).nullable();
        t.string('area_unit', 100).nullable();
        t.decimal('tank_volume', 100, 50).nullable();
        t.string('tank_volume_unit', 100).nullable();
        t.decimal('pump_in_rate', 100, 50).nullable();
        t.string('pump_in_rate_unit', 100).nullable();
        t.decimal('pump_out_rate', 100, 50).nullable();
        t.string('pump_out_rate_unit', 100).nullable();
        t.string('simple_emergency_check', 100).nullable();
        
        t.string('tank_latitude', 100).nullable();
        t.string('avg_Storage_Temp', 100).nullable();
        t.decimal('boiling_Point', 100, 50).nullable();
        t.decimal('flashing_Liquid', 100, 50).nullable();
        t.string('flashing_Liquid_Check', 100).nullable();
        t.decimal('flashing_Point', 100, 50).nullable();
        t.decimal('heat_Transfer_Coeff', 100, 50).nullable();
        t.string('heat_Transfer_Unit', 100).nullable();
        t.string('insulated_A_Radio', 100).nullable();
        t.decimal('insulated_S_A', 100, 50).nullable();
        t.decimal('insulated_Per_A', 100, 50).nullable();
        t.decimal('insulation_Thermal_Cond', 100, 50).nullable();
        t.decimal('insulation_Thickness', 100, 50).nullable();
        t.decimal('other', 100, 50).nullable();
        t.string('outer_Containment_Radio', 100).nullable();
        t.decimal('outer_S_A', 100, 50).nullable();
        t.decimal('outer_S_A_Percent', 100, 50).nullable();
        t.decimal('regulator_Failure', 100, 50).nullable();
        t.decimal('rin', 100, 50).nullable();
        t.decimal('surface_Area', 100, 50).nullable();
        t.string('tank_Has_Insulation', 100).nullable();
        t.string('thermal_Cond_Unit', 100).nullable();
        t.decimal('vac_Thermal', 100, 50).nullable();
        t.string('vap_Sat_Pressure', 100).nullable();
        
      }).then((d) => { 
      });
    }
  })

/*Sizing Errors Table*/
knex.schema.hasTable('sizing_errors').then(function(exists) {
 
  if (!exists) {
    return knex.schema.withSchema('public').createTable('sizing_errors', function(t) {      
      t.increments('sizing_error_id');
      t.integer('sd_id').unsigned();
      t.foreign('sd_id').references('sizing_data.sd_id');
      t.json('fluid_properties').nullable();
      t.json('temperature_properties').nullable();
      t.json('pressure_properties').nullable();
      t.json('application').nullable();
      t.json('requiredFlow').nullable();
      t.json('system_properties').nullable();
      t.json('vaccumcase_properties').nullable();
      t.json('flowrate_properties').nullable();
      t.json('pump_properties').nullable();
      t.json('tank_data').nullable();
      t.json('back_pressure').nullable();
      t.json('inlet_loss').nullable();
    }).then((d) => {
    });
  }
})

 //sizing_input data table
 knex.schema.hasTable('sizing_input').then(function(exists) { 
  if (!exists) {
    return knex.schema.withSchema('public').createTable('sizing_input', function(t) {      
      t.increments('sizing_input_id');
      t.string('sizing_id', 16).notNullable();
      t.integer('rev_num', 16).notNullable();
      t.string('sizing_basis', 255).nullable();
      t.string('type', 16).notNullable();
      t.json('sizing_input').nullable();
    }).then((d) => { 
    });
  }
})

//intermediate valv calculation data table
knex.schema.hasTable('calc_intermedi_value').then(function(exists) { 
  if (!exists) {
    return knex.schema.withSchema('public').createTable('calc_intermedi_value', function(t) {      
      t.increments('calc_id');
      t.string('sizing_id', 16).notNullable();          
      t.json('calc_result').nullable();
    }).then((d) => { 
    });
  }
})


knex.schema.hasTable('multi_valve_data').then(function(exists) { 
  if (!exists) {
    return knex.schema.withSchema('public').createTable('multi_valve_data', function(t) {      
      t.integer('sd_id').unsigned();
      t.string('sizing_item_id', 50).nullable();
      t.string('model', 40).nullable();
      t.string('rated_flow_per', 40).nullable();
      t.string('set_pres', 60).nullable();
      // new added
      t.integer('quantity', 3).nullable();
      t.string('sizing_id', 16).notNullable();
      t.string('size_orifice', 25).nullable();
      t.integer('item_number', 5).nullable();
    }).then((d) => { 
    });
  }
})

knex.schema.hasTable('tag_data').then(function(exists) { 
  if (!exists) {
    return knex.schema.withSchema('public').createTable('tag_data', function(t) {      
      t.integer('tag_id').unsigned();
      t.string('tag_number', 500).nullable();
      t.string('p_and_id', 500).nullable();
      t.string('service', 500).nullable();
      t.string('line_number', 500).nullable();
    }).then((d) => { 
    });
  }
})



}








module.exports = {
    createTable
}
