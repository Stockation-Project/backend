import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkRiskLevels() {
    const { data, error } = await supabase.from('stocks').select('risk_level');
    if (error) {
        console.error(error);
        return;
    }
    const counts = data.reduce((acc, curr) => {
        acc[curr.risk_level] = (acc[curr.risk_level] || 0) + 1;
        return acc;
    }, {});
    console.log("Risk Level Distribution:", counts);
}

checkRiskLevels();
