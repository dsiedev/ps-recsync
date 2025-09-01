<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class RecsyncCache
{
    private $tableName;

    public function __construct()
    {
        $this->tableName = _DB_PREFIX_ . 'recsync_cache';
    }

    /**
     * Get cached data
     */
    public function get($key)
    {
        $sql = 'SELECT cache_data, expires_at FROM ' . $this->tableName . ' 
                WHERE cache_key = "' . pSQL($key) . '" 
                AND expires_at > NOW()';
        
        $result = Db::getInstance()->getRow($sql);
        
        if ($result) {
            return json_decode($result['cache_data'], true);
        }
        
        return false;
    }

    /**
     * Set cached data
     */
    public function set($key, $data, $ttl = 300)
    {
        $cacheData = json_encode($data);
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
        
        // Delete existing entry if exists
        Db::getInstance()->delete($this->tableName, 'cache_key = "' . pSQL($key) . '"');
        
        // Insert new entry
        $sql = 'INSERT INTO ' . $this->tableName . ' (cache_key, cache_data, expires_at) 
                VALUES ("' . pSQL($key) . '", "' . pSQL($cacheData) . '", "' . $expiresAt . '")';
        
        return Db::getInstance()->execute($sql);
    }

    /**
     * Delete cached data
     */
    public function delete($key)
    {
        return Db::getInstance()->delete($this->tableName, 'cache_key = "' . pSQL($key) . '"');
    }

    /**
     * Clear all cache
     */
    public function clear()
    {
        return Db::getInstance()->execute('DELETE FROM ' . $this->tableName);
    }

    /**
     * Clean expired entries
     */
    public function clean()
    {
        return Db::getInstance()->execute('DELETE FROM ' . $this->tableName . ' WHERE expires_at < NOW()');
    }
}
